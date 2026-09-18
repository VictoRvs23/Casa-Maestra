# Casa-Maestra

Este repositorio es con el fin de desarrollar una app web para la empresa "Casa Maestra", la cual dispone de estudios/talleres (habitaciones) que son ofrecidas a los artistas, artesanos y docentes. Casa Maestra busca que las personas que quieran crear, diseñar, enseñar y compartir conocimientos, tengan un espacio para hacerlo a gusto.

# Modelo de ramificación
Trunk-Based Development
Se trabajará con el main como rama principal, se estarán creando ramas para cada función.

# Dependencias
------------------------------
Backend (Node.js / Express)
------------------------------
Dependencias de producción:
- bcrypt (^6.0.0): Encriptación de contraseñas para los usuarios.
- cors (^2.8.5): Control de acceso HTTP para comunicar el frontend con el backend (Cross-Origin Resource Sharing).
- dotenv (^16.4.5): Carga de variables de entorno desde el archivo .env.
- express (^4.19.2): Framework principal para la creación del servidor web y las rutas de la API.
- joi (^17.12.2): Validación estricta de esquemas y datos de entrada.
- jsonwebtoken (^9.0.2): Manejo de autenticación, autorización y sesiones mediante tokens JWT.
- morgan (^1.10.0): Logger para el registro de peticiones HTTP en la consola.
- multer (^2.2.0): Middleware para la gestión y subida de archivos o imágenes al servidor.
- nodemailer (^9.0.3): Módulo para el envío automatizado de correos electrónicos.
- pg (^8.11.3): Cliente nativo de PostgreSQL para conectar la base de datos con Node.js.
- reflect-metadata (^0.2.1): Librería requerida por TypeORM para habilitar el uso de decoradores.
- typeorm (^0.3.28): ORM principal para estructurar y gestionar la base de datos relacional.

Dependencias de Desarrollo:
- nodemon (^3.1.0): Utilidad de desarrollo que reinicia automáticamente el servidor al detectar cambios en el código.

------------------------------
Frontend (React / Vite)
------------------------------
Dependencias de producción:
- axios (^1.19.0): Cliente HTTP basado en promesas utilizado para realizar las peticiones a la API del backend.
- html2canvas (^1.4.1): Herramienta que permite tomar capturas de pantalla de elementos del DOM, útil para la generación de reportes.
- jspdf (^4.2.1): Librería para la generación y exportación dinámica de archivos PDF directamente desde el navegador.
- jwt-decode (^4.0.0): Utilidad para decodificar los tokens JWT y leer la información de la sesión del usuario de forma segura.
- nodemailer (^9.0.3): Librería para el envío de correos electrónicos.
- react (^18.2.0): Librería base para la construcción de interfaces de usuario mediante componentes.
- react-dom (^18.2.0): Paquete encargado de renderizar los componentes de React en el DOM del navegador.
- react-icons (^5.6.0): Colección masiva de íconos vectoriales personalizables para la interfaz.
- react-router-dom (^7.11.0): Enrutador oficial para manejar la navegación entre las distintas páginas sin recargar el sitio (SPA).
- sweetalert2 (^11.26.25): Librería para crear cuadros de diálogo, alertas y modales interactivos y estéticos.

Dependencias de Desarrollo:
- @types/react (^18.2.37) & @types/react-dom (^18.2.15): Paquetes que proveen las definiciones de tipos para mejorar el autocompletado y análisis de código.
- @vitejs/plugin-react (^4.2.0): Plugin oficial para integrar y optimizar React dentro del entorno de Vite.
- eslint (^8.57.0): Herramienta de análisis de código estático para identificar problemas y estandarizar la escritura del código.
- eslint-plugin-react (^7.34.1), eslint-plugin-react-hooks (^4.6.0), eslint-plugin-react-refresh (^0.4.6): Reglas específicas de ESLint para asegurar las buenas prácticas en React.
- vite (^7.0.0): Entorno de desarrollo local ultrarrápido y empaquetador (bundler) para la construcción final a producción.
