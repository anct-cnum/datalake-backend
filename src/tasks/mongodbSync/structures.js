#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');
const { encrypt } = require('../../utils/encrypt');

execute(__filename, async ({ logger, db, dbDatalake }) => {
  const structures = await db.collection('structures').find({}).toArray();
  let count = 0;
  const promises = [];
  structures.forEach(structure => {
    promises.push(new Promise(async resolve => {
      count++;

      // Security ❤️
      structure._id = encrypt(structure._id.toString());
      delete structure.idPG;
      delete structure.emailConfirmationKey;
      delete structure.historique;

      await dbDatalake.collection('structures').updateOne({ _id: structure._id }, { $set: structure }, { upsert: true });
      resolve();
    }));
  });
  await Promise.all(promises);
  logger.info(`${count} structures synced to datalake`);
});
