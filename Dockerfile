FROM node:8
COPY . /app
WORKDIR app
RUN npm install -g grunt-cli bower
RUN npm install
RUN echo { \"allow_root\": true } > /root/.bowerrc
RUN grunt --force
RUN chmod u+x /app/scripts/startup.sh
EXPOSE 8080
CMD ["/app/scripts/startup.sh"]
