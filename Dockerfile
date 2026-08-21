# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies and clean cache to save disk space
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Set max memory limit for TypeScript build to prevent heap out of memory on small instances
ENV NODE_OPTIONS="--max-old-space-size=1536"

# Build the TypeScript project
RUN npm run build

# Stage 2: Production
FROM node:18-alpine

WORKDIR /usr/src/app
ENV TZ=Asia/Kolkata

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies and clean cache
RUN npm ci --omit=dev && npm cache clean --force

# Copy built files from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose port (Assuming 4000 based on env config)
EXPOSE 4000

# Start the server
CMD ["npm", "start"]
