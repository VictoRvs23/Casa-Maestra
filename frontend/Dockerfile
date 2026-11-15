# Imagen base: Node.js 22 sobre Alpine
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# URL de la API. Vite la inserta en el JS al compilar, por eso debe existir ANTES de "npm run build".
# El frontend la lee como import.meta.env.VITE_API_URL.
ARG VITE_API_URL=http://localhost:3000/api
ENV VITE_API_URL=${VITE_API_URL}

# Genera la carpeta dist/ lista para producción
RUN npm run build

EXPOSE 4173

# Vite Preview en 0.0.0.0 para que se pueda abrir desde fuera del contenedor
CMD ["./node_modules/.bin/vite", "preview", "--host", "0.0.0.0", "--port", "4173"]