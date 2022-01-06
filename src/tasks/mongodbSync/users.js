#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');
const { encrypt } = require('../../utils/encrypt');

execute(__filename, async ({ logger, db, dbDatalake }) => {
  const users = await db.collection('users').find({}).toArray();
  let count = 0;
  const promises = [];
  users.forEach(user => {
    promises.push(new Promise(async resolve => {
      count++;

      const whitelist = [
        '_id',
        'roles',
        'mailSentDate',
        'passwordCreated',
        'createdAt',
        'resend',
        'mailCoopSent'
      ];

      for (const property in user) {
        if (!whitelist.includes(property)) {
          delete user[property];
        }
      }

      user._id = encrypt(user._id.toString());

      await dbDatalake.collection('cras').updateOne({ _id: user._id }, { $set: user }, { upsert: true });
      resolve();
    }));
  });
  await Promise.all(promises);
  logger.info(`${count} users synced to datalake`);
});
