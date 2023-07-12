#!/usr/bin/env node
'use strict';

require('dotenv').config();

const { execute } = require('../../utils');
const { program } = require('commander');

const getConseillersId = async dbDatalake => await dbDatalake.collection('cras').distinct(
  'conseillerId',
  { 'structureId': { '$exists': false }
  }
);

const getConseiller = dbDatalake => async conseillerId => await dbDatalake.collection('conseillers').findOne({
  '_id': conseillerId,
  'statut': 'RECRUTE'
});

const updateCraDatalake = dbDatalake => async (conseillerId, structureId) => await dbDatalake.collection('cras').updateMany({
  'conseillerId': conseillerId,
  'structureId': { '$exists': false },
}, {
  '$set': {
    'structureId': structureId
  }
});

execute(__filename, async ({ logger, dbDatalake }) => {
  program.option('-l, --limit <limit>', 'limit');
  program.helpOption('-e', 'HELP command');
  program.parse(process.argv);

  try {
    let promises = [];
    const conseillersIds = await getConseillersId(dbDatalake);
    let count = 0;
    let countConseillersNull = 0;
    conseillersIds.forEach(conseillerId => {
      promises.push(new Promise(async resolve => {
        const conseiller = await getConseiller(dbDatalake)(conseillerId);
        if (conseiller) {
          await updateCraDatalake(dbDatalake)(conseillerId, conseiller.structureId);
          count++;
        } else {
          logger.info(conseillerId);
          countConseillersNull++;
        }
        resolve();
      }));
    });

    await Promise.all(promises);
    logger.info('Il y a eu ' + count + ' conseillers traités !');
    logger.info('Il y a eu ' + countConseillersNull + ' conseiller présents dans les cras absents dans la collection conseillers !');

  } catch (error) {
    logger.error(error);
  }
});
