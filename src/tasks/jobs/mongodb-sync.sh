#!/bin/bash -l

cd ${APP_HOME}

echo "MongoDB database synchronization : START\n"
node src/tasks/mongodbSync/conseillers
node src/tasks/mongodbSync/cras
node src/tasks/mongodbSync/structures
echo "MongoDB database synchronization : END\n"
