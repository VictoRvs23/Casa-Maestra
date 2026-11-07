import "./styles/Tema.css";
import "./styles/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AlertaProvider } from "./context/AlertaContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AlertaProvider>
        <App />
      </AlertaProvider>
    </AuthProvider>
  </React.StrictMode>
);