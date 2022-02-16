#!/bin/bash -l

cd ${APP_HOME}

echo "Exports fichier conseillers SIT: START\n"
node src/tasks/sit/conseillers-sit.js
echo "Exports fichiers conseillers SIT: END\n"

echo "Exports fichiers structures SIT: START\n"
node src/tasks/sit/structures-sit.js
echo "Exports fichiers structures SIT: END\n"
