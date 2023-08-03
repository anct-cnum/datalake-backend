#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');

const getConseillersSupprimes = async dbDatalake => await dbDatalake.collection('conseillersSupprimes').find({}, { '_id': 0, 'conseiller._id': 1 }).toArray();

const getConseillerById = dbDatalake => async conseillerId => await dbDatalake.collection('conseillers').findOne({ '_id': conseillerId });

const deleteConseiller = dbDatalake => async conseillerId => await dbDatalake.collection('conseillers').deleteOne({ '_id': conseillerId });

execute(__filename, async ({ logger, dbDatalake }) => {

  logger.info('Recherche des conseillersSupprimes qui seraient toujours présent dans la collection conseillers');
  logger.info('Et suppression s\'ils sont toujours présents');

  const promises = [];
  let suppressionConseiller = 0;

  const conseillersSupprimes = await getConseillersSupprimes(dbDatalake);
  conseillersSupprimes?.forEach(conseillerSupprime => {
    promises.push(new Promise(async resolve => {
      const conseiller = await getConseillerById(dbDatalake)(conseillerSupprime.conseiller._id);
      if (conseiller) {
        try {
          deleteConseiller(dbDatalake)(conseiller._id);
          logger.info('Suppression de l\'id ' + conseiller._id);
          suppressionConseiller++;
        } catch (error) {
          logger.error(error);
        }
      }
      resolve();
    }));
  });
  await Promise.all(promises);
  logger.info('Fin de la suppression des conseillers. Total = ' + suppressionConseiller);
});
