# Dockerfile
FROM node:18

# Install PostgreSQL client tools for pg_isready
RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Make start.sh executable
RUN chmod +x ./start.sh

EXPOSE 3000
CMD ["./start.sh"]
