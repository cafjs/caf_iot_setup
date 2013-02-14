#!/bin/bash
echo "GIT setup script called <git repository>" $1 
APP_REPO_DIR=${APP_REPO_DIR:-application}

if [ -d $APP_REPO_DIR ]
then
    cd $APP_REPO_DIR
    CURRENT_APP=`git remote -v | awk '{print $2}' | head -1`
    if [ $1 = $CURRENT_APP ]
    then 
        echo "Update"
        git pull
        npm install
    else
        echo "Reset and install"
        cd ..
        rm -fr $APP_REPO_DIR
        git clone $1 $APP_REPO_DIR
        cd $APP_REPO_DIR
        npm install
    fi
else
    echo "Install"
    git clone $1 $APP_REPO_DIR
    cd $APP_REPO_DIR
    npm install
fi

exit $?
