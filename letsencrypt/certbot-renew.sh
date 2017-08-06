#!/usr/bin/env bash

while getopts ":s:" opt; do
  case $opt in
    s)
      webserver_container=$OPTARG
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

docker pull pierreprinetti/certbot:latest

if [ -z ${webserver_container+x} ]; then :; else
  webserver_is_running=$(docker inspect -f {{.State.Running}} $webserver_container)
  if $webserver_is_running; then docker stop $webserver_container; fi
fi

docker run \
  -v $(pwd)/data/letsencrypt/nginx-certs:/etc/letsencrypt \
  -e http_proxy=$http_proxy \
  -e renew=true \
  -p 80:80 \
  -p 443:443 \
  --rm pierreprinetti/certbot:latest

if [ -z ${webserver_container+x} ]; then :; else
  if $webserver_is_running; then docker start $webserver_container; fi
fi
