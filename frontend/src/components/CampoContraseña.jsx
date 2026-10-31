import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import "../styles/CampoContrasena.css";

export default function CampoContrasena({ conOjo = true, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`password-input-wrapper ${conOjo ? "con-ojo" : ""}`}>
      <input {...props} type={conOjo && visible ? "text" : "password"} />

      {conOjo && (
        <button
          type="button"
          className="ojo-contrasena"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          title={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <FaRegEyeSlash size={18} aria-hidden="true" /> : <FaRegEye size={18} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}