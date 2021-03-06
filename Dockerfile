FROM mhart/alpine-node:11.8.0

#Install git for nano-adaptor dependency install. Could change to use a git submodule which might negate this.
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && \
    apk add --no-cache curl #for debuging

# Provides cached layer for node_modules
ADD package.json /tmp/package.json
#ADD dependencies/nano-adapter/ /tmp/dependencies/nano-adapter
ENV NODE_PATH /app
RUN cd /tmp && npm install --production

RUN mkdir -p /app/server && cp -a /tmp/node_modules /app/
#copy package.json to app so npm run-script can be called
ADD /package.json /app/
ADD /couchdb /app/couchdb
ADD /couchdb-dev /app/couchdb-dev

#install pm2 globally
RUN npm install -g pm2

# Define working directory
WORKDIR /app
ADD server /app/server

EXPOSE 9000

#ENV NODE_ENV production
#forcing couch and redis hosts to localhost to connect via k8s
ENV NODE_ENV development
#CMD ["pm2-docker", "--public", "2a1aiec0svvgtf0", "--secret", "lira4uhnz1iqo21",  "server/app.js", "--web"]
CMD ["pm2-docker", "server/app.js"]

#CMD ["npm", "run", "start-prod"]
#CMD ["npm", "start"]
