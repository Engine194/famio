import { createBrowserRouter } from "react-router-dom";
import App from "./components/App";
import Explore from "./components/Explore";
import Layout from "./components/Layout";
import Error from "./components/Error";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/explore",
        element: <Explore />,
      },
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/error",
        element: <Error/>
      }
    ],
  },
]);
