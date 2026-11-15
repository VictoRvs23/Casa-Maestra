# Imagen base: Node.js 22 sobre Alpine (ligera)
FROM node:22-alpine

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copia los package*.json primero para aprovechar la caché de Docker
COPY package*.json ./
RUN npm install

# Copia el resto del código del backend
COPY . .

# La API escucha en el puerto 3000
EXPOSE 3000

# Arranca la API directamente con Node
CMD ["node", "src/index.js"]