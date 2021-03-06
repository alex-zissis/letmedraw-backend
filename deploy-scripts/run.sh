#!/usr/bin/env bash
cd "/opt/app/"
 
cd $(ls -td letmedraw* | head -1)
source .env

DBPORT=27017
DBNAME=letmedraw
DBHOST=localhost
PORT=3000
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

if [ $ENVIRONMENT == "staging" ]; then
    DBNAME="letmedraw-staging"
    PORT=5000
fi

NAME="letmedraw-$ENVIRONMENT"
docker stop $NAME || echo "No such image $NAME"
docker rm $NAME || echo "No such image $NAME"

docker run -d --name $NAME --env "DBPORT=$DBPORT" --env "DBNAME=$DBNAME" --env "DBHOST=$(hostname -I | awk '{print $1}')" --expose 3000 -p "$PORT:3000" "letmedraw:$PACKAGE_VERSION"