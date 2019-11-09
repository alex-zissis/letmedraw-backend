#!/usr/bin/env bash
set -e

# update instance
yum -y update

source /opt/app/letmedraw/.env
mv "/opt/app/letmedraw" "/opt/app/letmedraw-$ENVIRONMENT"