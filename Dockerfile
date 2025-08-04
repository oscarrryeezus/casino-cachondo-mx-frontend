# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Construir la app para producción
RUN npm run build

# Servir la app con un servidor estático (por ejemplo, nginx)
FROM nginx:stable-alpine

# Copiar build a la carpeta de nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
