#!/usr/bin/env node
'use strict';
const departements = require('../../../data/departements-region.json');

const { execute } = require('../utils');
const { program } = require('commander');

program.parse(process.argv);

execute(__filename, async ({ dbDatalake, logger, exit }) => {

  logger.info('Fill regions and departements filters');

  try {
    await dbDatalake.collection('stats_filtres').deleteMany({});

    for (const dep of departements) {
      //Filtres pour la collection stats_StructuresValidees (même niveau d'arborescence obligatoire)
      dep.codeDepartement = String(dep.num_dep);
      dep.departement = String(dep.dep_name);
      dep.region = String(dep.region_name);
      //Filtres pour les collections existantes stats par département et par date (même niveau d'arborescence obligatoire)
      dep.data = {
        numeroDepartement: String(dep.num_dep),
        departement: String(dep.dep_name),
        region: String(dep.region_name)
      };
      //Suppression des valeurs désormais inutiles
      delete dep.num_dep;
      delete dep.dep_name;
      delete dep.region_name;
      await dbDatalake.collection('stats_filtres').insertOne(dep);
    }

    //Ajout Saint Martin
    await dbDatalake.collection('stats_filtres').insertOne({
      codeDepartement: '978',
      departement: 'Saint-Martin',
      region: 'Saint-Martin',
      data: {
        numeroDepartement: '978',
        departement: 'Saint-Martin',
        region: 'Saint-Martin'
      }
    });
  } catch (e) {
    logger.error(e);
  }
  exit();
});
