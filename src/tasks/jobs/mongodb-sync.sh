#!/bin/bash -l

cd ${APP_HOME}

echo "MongoDB database synchronization : START\n"
node src/tasks/mongodbSync/conseillers
node src/tasks/mongodbSync/conseillersSupprimes
node src/tasks/mongodbSync/countTotalConseillers
node src/tasks/mongodbSync/structures
node src/tasks/mongodbSync/users
echo "MongoDB database synchronization : END\n"
