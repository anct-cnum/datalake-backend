#!/usr/bin/env node
'use strict';

require('dotenv').config();

const { execute } = require('../utils');
const { encrypt } = require('../../utils/encrypt');
const { program } = require('commander');

// Partie 1 => Filtre des conseillers qui ont des CRAS sans id Structure dans le datalake
const idConseillerDbAndDatalake = async db => {
  const result = await db.collection('cras').distinct('conseiller.$id');
  return result.map(e => ({ idConseillerDB: e, idConseillerDatalake: encrypt(e.toString()) }));
};
const idCnMatchCraSansStructureId = dbDatalake => async arrayIdConseiller => {
  const resultDatalake = await dbDatalake.collection('cras').find('conseillerId', { 'structureId': { '$exists': false } });
  const concatArray = arrayIdConseiller.map(e => e.idConseillerDatalake).concat(resultDatalake);
  return concatArray.filter((x, i, a) => a.indexOf(x) !== i); // return uniquement les values qui ont au moins 1 doublon dans le concatArray
};

// Partie 2 => find des cras concerné à updater
const getCrasToConseiller = db => async id => await db.collection('cras').find({
  'conseiller.$id': id,
  'createdAt': { $lte: new Date('2022-12-01') }
}).toArray();
const getIdCrasSansId = dbDatalake => async id => await dbDatalake.collection('cras').distinct('_id',
  { 'conseillerId': id, 'structureId': { '$exists': false } });

// Partie 3 => ajout de la structure Id pour le CRA manquant !
const updateCraDatalake = dbDatalake => async (craId, structureId) => await dbDatalake.collection('cras').updateOne(
  { _id: encrypt(craId.toString())
  }, {
    $set: {
      structureId: encrypt(structureId.toString())
    }
  });

execute(__filename, async ({ logger, db, dbDatalake }) => {
  program.option('-l, --limit <limit>', 'limit');
  program.helpOption('-e', 'HELP command');
  program.parse(process.argv);

  const arrayIdConseiller = await idConseillerDbAndDatalake(db);
  const idConseillerMatchDatalake = await idCnMatchCraSansStructureId(dbDatalake)(arrayIdConseiller);
  const conseillerCraToUpdate = arrayIdConseiller.filter(e => idConseillerMatchDatalake.includes(e.idConseillerDatalake));
  const conseillerCraToUpdateLimit = conseillerCraToUpdate.slice(~~program.limit);
  let modifiedCount = 0;

  try {
    let promises = [];
    conseillerCraToUpdateLimit.forEach(obj => {
      promises.push(new Promise(async resolve => {
        const crasCNfs = await getCrasToConseiller(db)(obj.idConseillerDB);
        const getCraSansIdToConseiller = await getIdCrasSansId(dbDatalake)(obj.idConseillerDatalake);
        const filtreCraSansIdSA = crasCNfs.filter(e => getCraSansIdToConseiller.includes(encrypt(e._id.toString())));
        for (let c of filtreCraSansIdSA) {
          await updateCraDatalake(dbDatalake)(c._id, c.structure.oid);
        }
        modifiedCount++;
        resolve();
      }));
    });
    await Promise.all(promises);
  } catch (error) {
    logger.info(`Une erreur s'est produite lors de la mise à jour des CRAs (DataLake)`, error);
  }

  logger.info(`${modifiedCount} / ${conseillerCraToUpdate.length} conseiller(s) concerné, ont eu des CRAs mis à jour`);
});

