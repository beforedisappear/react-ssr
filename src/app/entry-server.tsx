import {
  type RenderToPipeableStreamOptions,
  renderToPipeableStream,
} from "react-dom/server";
import { App } from "./app";
import { StaticRouter } from "react-router-dom";

export function render(url: string, options?: RenderToPipeableStreamOptions) {
  return renderToPipeableStream(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>,
    options
  );
}
