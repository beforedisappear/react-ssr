import "./index.css";

import { StrictMode } from "react";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";
import { QueryProvider } from "./providers/query-provider";

export function App() {
  const element = useRoutes(routes);

  return (
    <StrictMode>
      <QueryProvider>{element}</QueryProvider>
    </StrictMode>
  );
}
