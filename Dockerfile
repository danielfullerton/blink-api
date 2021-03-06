# copy over our built project code to the container (this is done in a separate step in case you need any additional Node build steps here)
FROM node:12-alpine
WORKDIR /usr/app
COPY ./ ./

EXPOSE 8080
CMD ["npm", "start"]
