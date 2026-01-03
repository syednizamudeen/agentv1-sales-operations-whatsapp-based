# 1. Use a lightweight Node.js version
FROM node:20-slim

# 2. Set the directory inside the container for your code
WORKDIR /usr/src/app

# 3. Copy only the dependency files first (for faster builds)
COPY package*.json ./

# 4. Install your libraries (LangChain, Express, PG, etc.)
RUN npm install

# 5. Copy the rest of your local source code into the container
COPY . .

# 6. Open the port your app uses
EXPOSE 3000

# 7. Start the app (using 'node' for production or 'nodemon' for dev)
CMD ["node", "index.js"]