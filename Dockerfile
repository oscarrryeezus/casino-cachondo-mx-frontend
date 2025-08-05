# Etapa 1: build
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: servidor nginx
FROM nginx:stable-alpine

# Copiar la build al directorio que sirve Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Cambiar el puerto de Nginx a 3000
RUN sed -i 's/80/3000/g' /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
