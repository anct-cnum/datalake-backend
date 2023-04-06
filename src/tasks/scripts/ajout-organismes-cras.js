#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');
const { encrypt } = require('../../utils/encrypt');

const getCrasSansOrganisme = dbDatalake => async () =>
  await dbDatalake.collection('cras').find({ 'cra.organisme': { '$eq': null, '$exists': true } }).toArray();

const getCrasAvecOrganisme = dbDatalake => async () =>
  await dbDatalake.collection('cras').find({ 'cra.organisme': { '$ne': null } }).toArray();

const updateCraDatalake = dbDatalake => async (craId, cra) => await dbDatalake.collection('cras').updateOne(
  { _id: encrypt(craId.toString())
  }, {
    $set: {
      cra: cra
    }
  });

execute(__filename, async ({ logger, db }) => {
  let modifiedCountSansOrganisme = 0;
  let modifiedCountAvecOrganisme = 0;

  /*1ère étape : s'occuper des cras sans organisme */
  logger.info(`Traitement des cras sans organisme`);
  const crasSansOrganisme = await getCrasSansOrganisme(db)();
  try {
    let promisesSansOrganisme = [];
    crasSansOrganisme?.forEach(cra => {
      promisesSansOrganisme.push(new Promise(async resolve => {
        delete cra.cra.organisme;
        cra.cra.organismes = null;
        updateCraDatalake(db)(cra._id, cra.cra);
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
  const crasAvecOrganisme = await getCrasAvecOrganisme(db)();
  try {
    let promisesAvecOrganisme = [];
    crasAvecOrganisme?.forEach(cra => {
      promisesAvecOrganisme.push(new Promise(async resolve => {
        cra.cra.organismes = [{ [cra.cra.organisme]: cra.cra.accompagnement.redirection }];
        delete cra.cra.organisme;
        updateCraDatalake(db)(cra._id, cra.cra);
        modifiedCountAvecOrganisme++;
        resolve();
      }));
    });
  } catch (error) {
    logger.info(`Une erreurs s'est produite lors de la mise à jour des CRAs`, error);
  }
  logger.info(`${modifiedCountAvecOrganisme} CRAs avec organisme mis à jour`);

});
