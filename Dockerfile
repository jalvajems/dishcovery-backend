# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /usr/src/app
ENV TZ=Asia/Kolkata

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built files from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose port (Assuming 4000 based on env config)
EXPOSE 4000

# Start the server
CMD ["npm", "start"]
