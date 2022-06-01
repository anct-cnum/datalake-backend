#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');
const { encrypt } = require('../../utils/encrypt');

execute(__filename, async ({ logger, db, dbDatalake }) => {
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - 2); //On reprend à partir d'avant hier (trop de données => toArray en erreur)
  startDate.setUTCHours(0, 0, 0, 0);
  const cras = await db.collection('cras').find({ createdAt: { $gte: startDate } }).toArray();
  let count = 0;
  const promises = [];
  cras.forEach(cra => {
    promises.push(new Promise(async resolve => {
      count++;

      const whitelist = [
        '_id',
        'cra',
        'conseiller',
        'createdAt'
      ];

      for (const property in cra) {
        if (!whitelist.includes(property)) {
          delete cra[property];
        }
      }

      cra._id = encrypt(cra._id.toString());
      cra.conseillerId = encrypt(cra.conseiller.oid.toString());
      delete cra.conseiller;

      await dbDatalake.collection('cras').updateOne({ _id: cra._id }, { $set: cra }, { upsert: true });
      resolve();
    }));
  });
  await Promise.all(promises);
  logger.info(`${count} CRA synced to datalake`);
});
