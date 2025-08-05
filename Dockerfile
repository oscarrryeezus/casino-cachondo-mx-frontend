FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production

COPY --from=build /app/build /usr/share/nginx/html

# Copia tu configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expón el puerto 3000
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
