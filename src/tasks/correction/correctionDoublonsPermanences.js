#!/usr/bin/env node
'use strict';
const csv = require('csv-parser');
const fs = require('fs');
const { encrypt } = require('../../utils/encrypt');
const { execute } = require('../utils');

const updateCraWithIdPermanence = dbDatalake => async (id, ids) => await dbDatalake.collection('cras').updateMany(
  { 'permanenceId': { '$in': ids } },
  { 'permanenceId': id }
);

execute(__filename, async ({ logger, dbDatalake }) => {

  const permanences = [];
  const promises = [];
  let nbMaj = 0;

  logger.info('Modification des ids suite à la fusion des doublons de permanences');

  //eslint-disable-next-line max-len
  //idPermanence|estStructure|nomEnseigne|numeroTelephone|email|siteWeb|siret|adresse|location|horaires|typeAcces|conseillers|lieuPrincipalPour|conseillersItinerants|structure|updatedAt|updatedBy|doublons
  fs.createReadStream('data/imports/permanences-doublons.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', data => permanences.push(data))
  .on('end', () => {
    permanences.forEach(permanence => {
      promises.push(new Promise(async resolve => {
        const id = encrypt(permanence.idPermanence.toString());
        const ids = [];
        permanence.doublons.split(',').forEach(id => {
          ids.push(encrypt(id.toString()));
        });
        await updateCraWithIdPermanence(dbDatalake)(id, ids);
        nbMaj++;
        resolve();
      }));
    });
    Promise.all(promises);
  });

  logger.info(`${nbMaj} CRAs mis à jour`);
});
