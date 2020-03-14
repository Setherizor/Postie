FROM node:latest

# Defines our working directory in container
WORKDIR /usr/src/app

# Copies the package.json first for better cache on later pushes
COPY package.json package.json
# Get dependencies
RUN JOBS=MAX npm install --production --unsafe-perm && npm cache verify && rm -rf /tmp/*

# This will copy all files in our root to the working  directory in the container
# Our precious bot needs to move to the working directory
COPY . ./

EXPOSE 8080

# server.js will run when container starts up on the device
# CMD ["npm", "start"]
CMD ["npm", "run", "start:app", "--silent"]
