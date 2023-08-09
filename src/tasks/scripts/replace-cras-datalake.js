#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');
const { encrypt } = require('../../utils/encrypt');

// node src/tasks/scripts/replace-cras-datalake.js

execute(__filename, async ({ logger, db, dbDatalake }) => {
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - 2); //Max 2 jours avant car on laissera le CRON pour les CRAS effectué dans les 2 derniers jours...
  startDate.setUTCHours(0, 0, 0, 0);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const countTotalCras = await db.collection('cras').countDocuments({ $or: [
    { createdAt: { $lte: startDate } },
    { updatedAt: { $lte: startDate } }
  ] });

  const calculLots = () => {
    const result = [];
    const limit = 100000;
    const lot = Math.ceil(countTotalCras / limit);
    for (let i = 0; i < lot; i++) {
      if (countTotalCras <= (i * limit)) {
        break;
      }
      result.push({ id: i, limit, skip: i * limit });
    }
    return result;
  };

  const lotsArray = await calculLots();

  logger.info(`Début des ${lotsArray.length} lots...`);

  for (const lot of lotsArray) {
    const cras = await db.collection('cras').find({ $or: [
      { createdAt: { $lte: startDate } },
      { updatedAt: { $lte: startDate } }
    ] }).limit(lot.limit).skip(lot.skip).toArray();
    const promises = [];
    let count = 0;
    await cras.forEach(cra => {
      promises.push(new Promise(async resolve => {
        const whitelist = [
          '_id',
          'cra',
          'conseiller',
          'structure',
          'permanence',
          'createdAt',
          'updatedAt'
        ];

        for (const property in cra) {
          if (!whitelist.includes(property)) {
            delete cra[property];
          }
        }

        cra._id = encrypt(cra._id.toString());
        cra.conseillerId = encrypt(cra.conseiller.oid.toString());
        if (cra.permanence) {
          cra.permanenceId = encrypt(cra.permanence.oid.toString());

        }
        if (cra.structure) {
          cra.structureId = encrypt(cra.structure.oid.toString());

        }
        delete cra.conseiller;
        delete cra.permanence;
        delete cra.structure;
        count++;
        resolve();
      }));
    });
    await Promise.all(promises);
    await dbDatalake.collection('cras-insert').insertMany(cras);
    logger.info(`Le lot ${lot.id + 1} / ${lotsArray.length} effectué (+ ${count} CRAS)`);
    await sleep(1000);
  }
});
