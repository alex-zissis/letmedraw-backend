#!/bin/bash
if [ $TRAVIS_BRANCH == "master" ]; then
    echo "export ENVIRONMENT=prod" > .env
else 
    echo "export ENVIRONMENT=staging" > .env
fi
