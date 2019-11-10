#!/usr/bin/env bash
cd "/opt/app/"
 
cd $(ls -td letmedraw* | head -1)
source .env
name="letmedraw-$ENVIRONMENT"

docker stop $name || echo "No such image $name"
docker rm $name || echo "No such image $name"
