FROM node:8
COPY . .
RUN chmod u+x scripts/startup.sh
EXPOSE 8080
CMD ["./scripts/startup.sh"]
