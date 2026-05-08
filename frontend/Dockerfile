# Frontend Dockerfile - Multi-stage build
FROM node:20-alpine AS builder

# Define working directory
WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Build da aplicação
RUN npm run build

# Stage final - nginx para servir arquivos estáticos
FROM nginx:alpine

# Copia o build para o nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Copia configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta
EXPOSE 80

# Inicia o nginx
CMD ["nginx", "-g", "daemon off;"]
