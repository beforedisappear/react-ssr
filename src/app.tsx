import "./index.css";

import { StrictMode } from "react";
import { useRoutes } from "react-router-dom";
import { routes } from "./routes";

export function App() {
  const element = useRoutes(routes);

  return <StrictMode>{element}</StrictMode>;
}
