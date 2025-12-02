import { useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import { SocketProvider } from "./contexts/SocketContext";

import MainLayout from "./pages/MainLayout";
import ErrorPage from "./pages/Error";
import HomePage from "./pages/Home";
import Play from "./pages/Play";
import Arena from "./pages/Arena";
import Rules from "./pages/Rules";
import Cards from "./pages/Cards";
import Settings from "./pages/Settings";
import Updates from "./pages/Updates";

import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/play",
        element: <Play />,
      },
      {
        path: "/arena/:gid",
        element: <Arena />,
      },
      {
        path: "/rules",
        element: <Rules />,
      },
      {
        path: "/cards",
        element: <Cards />
      },
      {
        path: "/settings",
        element: <Settings />
      },
      {
        path: "/updates",
        element: <Updates />
      }
    ],
  },
]);

function App() {
  return (
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  );
}

export default App;
