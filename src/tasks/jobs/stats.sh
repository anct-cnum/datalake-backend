#!/bin/bash -l

cd ${APP_HOME}

echo "Creating statistics data for metabase : START\n"
node src/tasks/stats/index.js
node src/tasks/stats/cras/cumulBydepartements/index.js
echo "Creating statistics data for metabase : END\n"
