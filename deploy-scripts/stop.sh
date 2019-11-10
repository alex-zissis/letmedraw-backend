#!/usr/bin/env bash
cd "/opt/app/"
 
cd $(ls -td letmedraw* | head -1)
source .env
name="letmedraw-$ENVIRONMENT"

docker stop $name
docker rm $name
