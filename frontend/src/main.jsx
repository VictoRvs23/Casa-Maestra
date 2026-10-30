import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./styles/index.css";
import { AlertaProvider } from "./context/AlertaContext.jsx";
import "./styles/Tema.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <AlertaProvider>
        <App />
      </AlertaProvider>
    </AuthProvider>
  </React.StrictMode>
);