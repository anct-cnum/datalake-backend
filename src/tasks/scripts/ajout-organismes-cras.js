#!/usr/bin/env node
'use strict';

require('dotenv').config();

const { execute } = require('../utils');
const { program } = require('commander');

const getCrasSansOrganisme = dbDatalake => async limit =>
  await dbDatalake.collection('cras').find({ 'cra.organisme': { '$eq': null, '$exists': true } }).limit(limit).toArray();

const getCrasAvecOrganisme = dbDatalake => async limit =>
  await dbDatalake.collection('cras').find({ 'cra.organisme': { '$ne': null } }).limit(limit).toArray();

const updateCraDatalake = dbDatalake => async (craId, cra) => await dbDatalake.collection('cras').updateOne(
  { _id: craId
  }, {
    $set: {
      cra: cra
    }
  });

execute(__filename, async ({ logger, dbDatalake }) => {
  program.option('-l, --limit <limit>', 'limit');
  program.helpOption('-e', 'HELP command');
  program.parse(process.argv);
  let modifiedCountSansOrganisme = 0;
  let modifiedCountAvecOrganisme = 0;
  const limit = program._optionValues.limit ? ~~program._optionValues.limit : 1;

  /*1ère étape : s'occuper des cras sans organisme */
  logger.info(`Traitement des cras sans organisme`);
  const crasSansOrganisme = await getCrasSansOrganisme(dbDatalake)(limit);
  console.log(crasSansOrganisme);
  try {
    let promisesSansOrganisme = [];
    crasSansOrganisme?.forEach(cra => {
      promisesSansOrganisme.push(new Promise(async resolve => {
        delete cra.cra.organisme;
        cra.cra.organismes = null;
        updateCraDatalake(dbDatalake)(cra._id, cra.cra);
        modifiedCountSansOrganisme++;
        resolve();
      }));
    });
  } catch (error) {
    logger.info(`Une erreurs s'est produite lors de la mise à jour des CRAs`, error);
  }
  logger.info(`${modifiedCountSansOrganisme} CRAs sans organisme mis à jour`);

  /*2ème étape : s'occuper des cras avec organisme */
  logger.info(`Traitement des cras avec organisme`);
  const crasAvecOrganisme = await getCrasAvecOrganisme(dbDatalake)(limit);
  try {
    let promisesAvecOrganisme = [];
    crasAvecOrganisme?.forEach(cra => {
      promisesAvecOrganisme.push(new Promise(async resolve => {
        cra.cra.organismes = [{ [cra.cra.organisme]: cra.cra.accompagnement.redirection }];
        delete cra.cra.organisme;
        updateCraDatalake(dbDatalake)(cra._id, cra.cra);
        modifiedCountAvecOrganisme++;
        resolve();
      }));
    });
  } catch (error) {
    logger.info(`Une erreurs s'est produite lors de la mise à jour des CRAs`, error);
  }
  logger.info(`${modifiedCountAvecOrganisme} CRAs avec organisme mis à jour`);

});
