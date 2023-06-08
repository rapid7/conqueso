FROM node:16
COPY . /app
WORKDIR app
RUN npm install -g yarn
RUN yarn install
RUN chmod u+x /app/scripts/startup.sh
EXPOSE 8080
CMD ["/app/scripts/startup.sh"]
