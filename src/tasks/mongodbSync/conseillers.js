#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');
const { encrypt } = require('../../utils/encrypt');

execute(__filename, async ({ logger, db, dbDatalake }) => {
  const conseillers = await db.collection('conseillers').find({}).toArray();
  let count = 0;
  const promises = [];
  conseillers.forEach(conseiller => {
    promises.push(new Promise(async resolve => {
      count++;

      // RGPD ❤️
      delete conseiller.nom;
      delete conseiller.prenom;
      delete conseiller.email;
      delete conseiller.telephone;
      delete conseiller.structureId;

      // Security ❤️
      conseiller._id = encrypt(conseiller._id.toString());
      delete conseiller.idPG;
      delete conseiller.cv?.file;
      delete conseiller.emailConfirmationKey;
      delete conseiller.sondageToken;

      await dbDatalake.collection('conseillers').updateOne({ _id: conseiller._id }, { $set: conseiller }, { upsert: true });
      resolve();
    }));
  });
  await Promise.all(promises);
  logger.info(`${count} conseillers synced to datalake`);
});
