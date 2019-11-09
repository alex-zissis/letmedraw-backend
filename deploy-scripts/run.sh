#!/usr/bin/env bash
cd "/opt/app/"
 
cd $(ls -td letmedraw* | head -1)

source .env

DBPORT=27017
DBNAME=letmedraw
DBHOST=localhost
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo $PACKAGE_VERSION

if [ $ENVIRONMENT -eq "staging"]; then
    $DBNAME="letmedraw-staging"
fi

docker run --name "letmedraw-$ENVIRONMENT" --env "DBPORT=$DBPORT" --env "DBNAME=$DBNAME" --env "DBHOST=$DBHOST" letmedraw:$PACKAGE_VERSION"

