#!/bin/bash

set -e

## Variables
SHELL_SCRIPT_PATH=$(dirname "$0")
BRANCH=$1
PROFILE=$2
APPLICATION_JAR_PATH_FILENAME=$3

# Colors
txtrst='\033[1;37m' # White
txtred='\033[1;31m' # Red
txtylw='\033[1;33m' # Yellow
txtpur='\033[1;35m' # Purple
txtgrn='\033[1;32m' # Green
txtgra='\033[1;30m' # Gray

## Early return usage
if [[ $# -ne 3 ]]; then
  echo -e "${txtylw}=======================================${txtrst}"
  echo -e "${txtgrn} Usage : $0 {branch-name} {local | prod} {ex) ./build/libs/subway-0.0.1-SNAPSHOT.jar}${txtrst}"
  echo -e "${txtylw}=======================================${txtrst}"
  exit
fi

add_line_crlf() {
  echo ""
}

pull_branch() {
  echo -e "${txtylw}=======================================${txtrst}"
  echo -e "${txtgrn} Pull branch: '$BRANCH' ${txtrst}"
  echo -e "${txtylw}=======================================${txtrst}"

  git pull origin "$BRANCH"

  add_line_crlf
}

build_application() {
  echo -e "${txtylw}=======================================${txtrst}"
  echo -e "${txtgrn} Build application source ${txtrst}"
  echo -e "${txtylw}=======================================${txtrst}"

  ./gradlew clean build

  add_line_crlf
}

## 1.Preprocess
"$SHELL_SCRIPT_PATH"/preprocess.sh

## 2.Restart redis
"$SHELL_SCRIPT_PATH"/redis.sh

## 3.Pull branch
pull_branch

## 4.Build application by Gradle
build_application

## 5.Shutdown previous processes
"$SHELL_SCRIPT_PATH"/shutdown.sh

## 6.Start new process
"$SHELL_SCRIPT_PATH"/start.sh "$PROFILE" "$APPLICATION_JAR_PATH_FILENAME"

## 7.Restart redis
"$SHELL_SCRIPT_PATH"/redis.sh

## 7.Restart reverse proxy
#"$SHELL_SCRIPT_PATH"/reverse_proxy.sh
