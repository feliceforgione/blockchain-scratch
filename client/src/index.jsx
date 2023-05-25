import React from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./pages/App";
import "./index.css";
import Blocks from "./pages/Blocks";
import Layout from "./pages/Layout";
import ConductTransaction from "./pages/ConductTransaction";
import TransactionPool from "./pages/TransactionPool";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "", element: <App /> },
      { path: "blocks", element: <Blocks /> },
      { path: "conduct-transaction", element: <ConductTransaction /> },
      { path: "transaction-pool", element: <TransactionPool /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
