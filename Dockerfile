# Use the official Node.js LTS image
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies using npm ci for consistency
RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

# Build the TypeScript source code
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]