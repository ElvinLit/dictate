import "./index.css";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { routes } from "./routes.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={routes} />
);
