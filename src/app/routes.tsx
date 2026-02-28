import type { RouteObject } from "react-router-dom";
import { RootLayout } from "./layouts/root-layout";
import { HomePage } from "./pages/home-page";
import { AboutPage } from "./pages/about-page";
import { CounterPage } from "./pages/counter-page";
import { NotFoundPage } from "./pages/not-found-pag";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "counter", element: <CounterPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];
