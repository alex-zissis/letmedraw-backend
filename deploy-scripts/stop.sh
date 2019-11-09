#!/usr/bin/env bash
name="letmedraw-$ENVIRONMENT"

sudo docker stop $name
sudo docker rm $name
