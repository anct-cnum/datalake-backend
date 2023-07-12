#!/usr/bin/env node
'use strict';

require('dotenv').config();
const { encrypt } = require('../../../utils/encrypt');
const { execute } = require('../../utils');
const { program } = require('commander');


const getConseillersRupture = async db => {
  const result = await db.collection('conseillers').find({ 'statut': 'RUPTURE' }).toArray();
  return result.map(e => ({ idConseillerDB: e._id, ruptureDB: e.ruptures, idConseillerDatalake: encrypt(e._id.toString()) }));
};

const getConseillerSupprimesRupture = async db => {
  const result = await db.collection('conseillersSupprimes').find({ 'conseiller.statut': 'RUPTURE' }).toArray();
  return result.map(e => ({ idConseillerDB: e.conseiller._id, ruptureDB: e.conseiller.ruptures, idConseillerDatalake: encrypt(e.conseiller._id.toString()) }));
};

const updateCraDatalake = dbDatalake => async (conseillerId, structureId, dateRupture) => await dbDatalake.collection('cras').updateMany({
  'conseillerId': conseillerId,
  'structureId': { '$exists': false },

}, {
  '$set': {
    'structureId': structureId
  }
});

const updateCraDatalakeBetween = dbDatalake => async (conseillerId, structureId, dateRupture1, dateRupture2) => await dbDatalake.collection('cras').updateMany({
  'conseillerId': conseillerId,
  'structureId': { '$exists': false },
  'createdAt': { '$gte': dateRupture1, '$lte': dateRupture2 }
}, {
  '$set': {
    'structureId': structureId
  }
});

execute(__filename, async ({ logger, db, dbDatalake }) => {
  program.option('-l, --limit <limit>', 'limit');
  program.helpOption('-e', 'HELP command');
  program.parse(process.argv);

  try {
    let promises = [];
    const rupturesObj = await getConseillersRupture(db);
    let count = 0;
    let countMultipleRupture = 0;
    rupturesObj.forEach(rupture => {
      promises.push(new Promise(async resolve => {
        if (rupture.ruptureDB.length === 1) {

          await updateCraDatalake(dbDatalake)(
            rupture.idConseillerDatalake,
            encrypt(rupture.ruptureDB[0].structureId.toString()),
            rupture.ruptureDB[0].dateRupture
          );
          count++;

        }
        if (rupture.ruptureDB.length === 2) {
          console.log(rupture);
          rupture.ruptureDB.forEach((r, i) => {
            promises.push(new Promise(async resolve => {
              console.log(r);
              if (i === 0) {
                const result = await updateCraDatalake(dbDatalake)(
                  rupture.idConseillerDatalake,
                  encrypt(r.structureId.toString()),
                  r.dateRupture
                );
                console.log(result);
              } else {
                const result2 = await updateCraDatalakeBetween(dbDatalake)(
                  rupture.idConseillerDatalake,
                  encrypt(r.structureId.toString()),
                  rupture.ruptureDB[i - 1].dateRupture,
                  r.dateRupture
                );
                console.log(result2);
              }
              resolve();
            }));
          });
          countMultipleRupture++;
        }
        resolve();
      }));
    });

    await Promise.all(promises);
    logger.info('Il y a eu ' + count + ' conseillers en rupture traités !');
    logger.info('Il y a eu ' + countMultipleRupture + ' conseillers avec de multiples ruptures !');

  } catch (error) {
    logger.error(error);
  }
  try {
    let promises = [];
    const supprimesRupturesObj = await getConseillerSupprimesRupture(db);
    let count = 0;
    supprimesRupturesObj.forEach(supprimeRupture => {
      promises.push(new Promise(async resolve => {
        if (supprimeRupture.ruptureDB.length === 1) {

          await updateCraDatalake(dbDatalake)(
            supprimeRupture.idConseillerDatalake,
            encrypt(supprimeRupture.ruptureDB[0].structureId.toString()),
            supprimeRupture.ruptureDB[0].dateRupture
          );
          count++;

        }
        resolve();
      }));
    });

    await Promise.all(promises);
    logger.info('Il y a eu ' + count + ' conseillers supprimés en rupture traités !');

  } catch (error) {
    logger.error(error);
  }
});

