# Use Node 20
FROM node:20

WORKDIR /app

# Copy package files first (better for caching)
COPY package*.json ./

# Install dependencies (include devDependencies so Vite is installed)
RUN npm install --legacy-peer-deps

# Copy the rest of your app
COPY . .

# Expose Vite port
EXPOSE 5173

# Run dev server with --host so it works inside Docker
CMD ["npm", "run", "dev", "--", "--host"]
