import { Link, Outlet } from "react-router-dom";
import { ThemeSwitcher } from "../../features/theme-switcher/theme-switcher";

export function RootLayout() {
  return (
    <>
      <header>
        <div>
          <a href="https://vite.dev" target="_blank">
            <img src="/vite.svg" className="logo" alt="Vite logo" />
          </a>
        </div>
        <h1>Vite + React + React Router</h1>
        <nav>
          <Link to="/">Главная</Link>
          <Link to="/about">О проекте</Link>
          <Link to="/counter">Счётчик</Link>
          <ThemeSwitcher />
        </nav>
      </header>

      {/* Здесь будут рендериться страницы */}
      <main>
        <Outlet />
      </main>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}
