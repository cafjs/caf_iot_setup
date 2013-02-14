#!/bin/bash
echo "App setup script called  <url> " $1
APP_REPO_DIR=${APP_REPO_DIR:-application}
if [ -d $APP_REPO_DIR ]
then
    cd $APP_REPO_DIR
    ./start.js $1
    exit $?
else
    echo "Error: app not installed"
    exit 1
fi
