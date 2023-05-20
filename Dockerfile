FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

EXPOSE 8080
ENV SECRET=""
ENV REDIS_PORT=""
ENV DEBUG=""
ENV URI_MONGO=""
ENV PASSWORD_REDIS=""
ENV PORT=""
ENV SECRET_SESSION=""
ENV HOST_REDIS=""
CMD [ "node", "app.js" ]