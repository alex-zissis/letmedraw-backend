#!/usr/bin/env bash
set -e

source /opt/app/letmedraw/.env
mv "/opt/app/letmedraw" "/opt/app/letmedraw-$ENVIRONMENT"
cd "/opt/app/letmedraw-$ENVIRONMENT"

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

echo $PACKAGE_VERSION

docker build -t letmedraw:$PACKAGE_VERSION .