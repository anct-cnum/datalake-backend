#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');
const { encrypt } = require('../../utils/encrypt');

execute(__filename, async ({ logger, db, dbDatalake }) => {
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - 2); //On reprend à partir d'avant hier (trop de données => toArray en erreur)
  startDate.setUTCHours(0, 0, 0, 0);
  const cras = await db.collection('cras').find({ $or: [
    { createdAt: { $gte: startDate } },
    { updatedAt: { $gte: startDate } }
  ] }).toArray();
  let count = 0;
  const promises = [];
  cras.forEach(cra => {
    promises.push(new Promise(async resolve => {
      count++;

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
      delete cra.conseiller;

      await dbDatalake.collection('cras').replaceOne({ _id: cra._id }, cra, { upsert: true });
      resolve();
    }));
  });
  await Promise.all(promises);
  logger.info(`${count} CRA synced to datalake`);

  //Suppression des cras dans le datalake suite à la suppression par des conseillers
  const promisesDelete = [];
  const deletedCras = await db.collection('cras_deleted').find({ deletedAt: { $gte: startDate } }).toArray();

  deletedCras.forEach(cra => {
    cra._id = encrypt(cra._id.toString());
    promisesDelete.push(new Promise(async resolve => {
      await dbDatalake.collection('cras').deleteOne({
        _id: cra._id
      });
      resolve();
    }));
  });
  await Promise.all(promisesDelete);
  logger.info(`CRAs deleted to datalake`);
});
