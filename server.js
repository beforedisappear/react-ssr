import fs from "node:fs/promises";
import express from "express";
import { Transform } from "node:stream";

const isProduction = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5173;
const base = process.env.BASE || "/";
const ABORT_DELAY = 10000;

/** @type {import('vite').ViteDevServer | undefined} */

// В продакшене заранее читаем собранный HTML-шаблон и держим его в памяти.
// В dev режиме шаблон читается с диска на каждый запрос, поэтому здесь пустая строка.
const templateHtml = isProduction
  ? await fs.readFile("./dist/client/index.html", "utf-8")
  : "";

// создание http сервера
const server = express();

// В зависимости от окружения подключаем либо Vite middleware (HMR, SSR-модуль), либо статическую раздачу
let vite;

if (!isProduction) {
  const { createServer } = await import("vite");

  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
    base,
  });
  server.use(vite.middlewares);
} else {
  // В продакшене используем заранее собранный бандл и статику
  const compression = (await import("compression")).default;
  // создание middleware для раздачи статических файлов
  const sirv = (await import("sirv")).default;
  // Сжимаем ответы (gzip/br) для экономии трафика
  server.use(compression());
  // Раздаём статику из папки dist/client (JS/CSS/картинки и т.п.)
  server.use(base, sirv("./dist/client", { extensions: [] }));
}

// раздача HTML
server.use("*all", async (req, res) => {
  try {
    // Приводим URL к внутреннему виду, убирая базовый префикс
    const url = req.originalUrl.replace(base, "");

    /** @type {string} */
    let template;
    /** @type {import('./src/entry-server.ts').render} */
    // Функция рендеринга React-дерева на сервере (SSR + streaming)
    let render;
    if (!isProduction) {
      // В dev режиме каждый раз читаем index.html с диска,
      // чтобы подхватывать изменения без пересборки.
      template = await fs.readFile("./index.html", "utf-8");
      // Пропускаем шаблон через Vite, чтобы он:
      // - внедрил dev-скрипты
      // - подставил правильные пути к ассетам
      template = await vite.transformIndexHtml(url, template);
      // Загружаем серверный entry через Vite (ESM-модуль с hot reload)
      render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
    } else {
      // В продакшене используем уже закэшированный HTML-шаблон
      template = templateHtml;
      // И импортируем собранный серверный бандл (CJS/ESM из dist/server)
      render = (await import("./dist/server/entry-server.js")).render;
    }

    let didError = false;

    const { pipe, abort } = render(url, {
      // Если React не смог отрендерить даже shell, отдаём простую 500-страницу.
      onShellError() {
        res.status(500);
        res.set({ "Content-Type": "text/html" });
        res.send("<h1>Something went wrong</h1>");
      },
      // Когда готов "каркас" HTML (shell), начинаем стримить его клиенту.
      onShellReady() {
        // Если в процессе рендера случилась ошибка, возвращаем 500, иначе 200.
        res.status(didError ? 500 : 200);
        res.set({ "Content-Type": "text/html" });

        // Разбиваем HTML-шаблон на две части по плейсхолдеру,
        // чтобы вставить туда потоковый SSR-вывод.
        const [htmlStart, htmlEnd] = template.split(`<!--app-html-->`);

        // Поток, через который React будет писать HTML, а мы — прокидывать в ответ.
        const transformStream = new Transform({
          transform(chunk, encoding, callback) {
            // Пишем куски HTML прямо в HTTP-ответ по мере готовности.
            res.write(chunk, encoding);
            callback();
          },
        });
        // Когда React закончил стримить, дописываем "хвост" шаблона и закрываем ответ.
        transformStream.on("finish", () => {
          res.write(htmlEnd);
          res.end();
        });

        // Сначала отправляем начало HTML (doctype, head, начало body и т.п.)
        res.write(htmlStart);
        // Затем передаём поток в React, который будет писать внутрь transformStream.
        pipe(transformStream);
      },
      // Любая ошибка во время рендеринга помечает ответ как ошибочный,
      // но мы всё равно пытаемся отдать максимально возможный HTML.
      onError(error) {
        didError = true;
        console.error(error);
      },
    });

    // На случай "подвисшего" рендера через заданный таймаут принудительно
    // прерываем React-рендеринг, чтобы не держать открытое соединение бесконечно.
    setTimeout(() => abort(), ABORT_DELAY);
  } catch (e) {
    // В dev-режиме Vite умеет править stack trace, чтобы он указывал на исходники.
    vite?.ssrFixStacktrace(e);
    console.log(e.stack);
    // В случае необработанной ошибки внутри обработчика возвращаем 500 и стек.
    res.status(500).end(e.stack);
  }
});

// Запускаем HTTP-сервер и логируем URL, по которому доступно приложение
server.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
