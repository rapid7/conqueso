FROM node:16
COPY . /app
WORKDIR /app
#RUN npm install -g yarn # we do not need this - node:16 image comes with yarn preinstalled. 
RUN yarn install
RUN chmod u+x /app/scripts/startup.sh
RUN ln -sv /app/client/node_modules/\@bower_components/ /app/client/bower_components # post install scripts in package.json were not linking correctly, hence this line.
EXPOSE 8080
CMD ["/app/scripts/startup.sh"]
