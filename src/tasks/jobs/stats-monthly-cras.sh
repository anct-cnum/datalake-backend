#!/bin/bash -l

cd ${APP_HOME}

echo "Stats monthly CRAs by departements: START\n"
node src/tasks/stats/cras/monthlyBydepartements/index.js
echo "Stats monthly CRAs by departements: END\n"
