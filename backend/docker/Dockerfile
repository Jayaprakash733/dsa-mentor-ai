FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       gcc \
       g++ \
       openjdk-21-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

CMD ["python", "--version"]