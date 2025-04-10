FROM node:20-alpine
WORKDIR ./

COPY ./src ./src

# Port sur lequel ton backend écoute
EXPOSE 3000

CMD ["sleep", "infinity"]

# Installer les dépendances pour le runner
RUN apt-get update && apt-get install -y curl libicu-dev ca-certificates

# Installer le GitHub runner
WORKDIR /runner
RUN curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.314.1/actions-runner-linux-x64-2.314.1.tar.gz \
  && tar xzf actions-runner.tar.gz && rm actions-runner.tar.gz

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
