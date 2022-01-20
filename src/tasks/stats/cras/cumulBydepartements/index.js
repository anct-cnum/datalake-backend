#!/usr/bin/env node
'use strict';

const cli = require('commander');
const { execute } = require('../../../utils');
require('moment/locale/fr');
const departements = require('../../../../../data/departements-region.json');
const statsAlltasks = require('./tasks');

cli.description('Statistiques CRAs cumulées par département')
.helpOption('-e', 'HELP command')
.parse(process.argv);

execute(__filename, async ({ logger, dbDatalake }) => {

  try {
    await statsAlltasks.getStatsDoms(dbDatalake);
    await statsAlltasks.getStatsStMartin(dbDatalake);
    await statsAlltasks.getStatsCorse2A(dbDatalake);
    await statsAlltasks.getStatsCorse2B(dbDatalake);
    await statsAlltasks.getStatsAllOthers(dbDatalake);

    const depsListFormatted = await statsAlltasks.getListDepsFormatted(dbDatalake, departements);

    let promises = [];
    depsListFormatted.forEach(departement => {
      promises.push(new Promise(async resolve => {
        const queryUpd = { 'num_dep': departement.num_dep.toString(), 'dep_name': departement.dep_name };
        const update = { $set: { count: departement['count'] } };
        const options = { upsert: true };
        await dbDatalake.collection('stats_departements_cras_cumul').updateOne(queryUpd, update, options);
        resolve();
      }));
    });
    await Promise.all(promises);

    await dbDatalake.collection('temporary_corse2a_stats_departements_cras_cumul').drop();
    await dbDatalake.collection('temporary_corse2b_stats_departements_cras_cumul').drop();
    await dbDatalake.collection('temporary_doms_stats_departements_cras_cumul').drop();
    await dbDatalake.collection('temporary_others_stats_departements_cras_cumul').drop();
    await dbDatalake.collection('temporary_stmartin_departements_cras_cumul').drop();

    logger.info('Fin de récupération des stats CRAs cumulées par département');
  } catch (error) {
    logger.error(error);
  }
});
