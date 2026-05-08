# Backend Dockerfile
FROM node:20-alpine

# Define working directory
WORKDIR /app

# Instala dependências necessárias para Prisma
RUN apk add --no-cache openssl

# Copia arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências
RUN npm install

# Gera o cliente Prisma
RUN npx prisma generate

# Copia o restante do código
COPY . .

# Compila TypeScript
RUN npm run build

# Expõe a porta
EXPOSE 3333

# Comando para iniciar
CMD ["npm", "start"]
