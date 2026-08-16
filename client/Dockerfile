# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Add a custom nginx configuration to support React Router (fallback to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
