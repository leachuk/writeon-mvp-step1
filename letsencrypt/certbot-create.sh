#!/bin/sh

docker pull pierreprinetti/certbot:latest

GetCert() {
        docker run \
          -v ~/projects/bardly/web-volume/letsencrypt/nginx-certs:/etc/letsencrypt \
          -e http_proxy=$http_proxy \
          -e domains="www.bardly.net" \
          -e email="stewartleachuk@hotmail.com" \
          -p 80:80 \
          -p 443:443 \
          --rm pierreprinetti/certbot:latest
}

echo "Getting certificates for www.bardly.net..."
GetCert

echo "Rebuilding frontend docker with certs..."
docker-compose down
docker-compose build
docker-compose up

echo "Done"
