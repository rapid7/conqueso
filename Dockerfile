# these node images comes with yarn preinstalled.
FROM node:20
ENV NODE_OPTIONS=--openssl-legacy-provider
COPY . /app
WORKDIR /app
RUN yarn install

# The idomatic thing to do would be to put everything inside a single package.json file.
# I'll try a post install script soon. TODO get a post install script to recursively run yarn installs on subdirs.
WORKDIR /app/client
RUN yarn install

WORKDIR /app
# post install scripts in /app/client/package.json were not linking correctly, if we want to be as low impact as
# possible (ie, as few changes as possible) we need this line
RUN ln -sv /app/client/node_modules/\@bower_components/ /app/client/bower_components

RUN chmod u+x /app/scripts/startup.sh
EXPOSE 8080

CMD ["/app/scripts/startup.sh"]
