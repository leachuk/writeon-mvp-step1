#FROM node:7.7.3
FROM mhart/alpine-node:7.7.3

# Provides cached layer for node_modules
ADD package.json /tmp/package.json
ADD dependencies/nano-adapter/ /tmp/dependencies/nano-adapter
ENV NODE_PATH /app
RUN cd /tmp && npm install --production

RUN mkdir -p /app/server && cp -a /tmp/node_modules /app/
#copy package.json to app so npm run-script can be called
ADD /package.json /app/
ADD /couchdb /app/couchdb

#install pm2 globally
RUN npm install -g pm2

# Define working directory
WORKDIR /app
ADD server /app/server

EXPOSE 9000

ENV NODE_ENV production
CMD ["pm2-docker", "server/app.js", "--web"]
#CMD ["npm", "run", "start-prod"]
#CMD ["npm", "start"]
