FROM node:latest
RUN mkdir /app
WORKDIR /app
COPY . /app/
ENV PATH /app/node_modules/.bin:$PATH
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start:dev"]
