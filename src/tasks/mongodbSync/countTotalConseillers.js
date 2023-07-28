#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');

execute(__filename, async ({ logger, db, dbDatalake }) => {
  const countConseillersSupprimes = await db.collection('conseillersSupprimes').countDocuments({});
  const countConseillers = await db.collection('conseillers').countDocuments({});
  const total = countConseillersSupprimes + countConseillers;

  await dbDatalake.collection('conseillersTotal').updateOne(
    { },
    { $set: { totalConseillers: total } },
    { upsert: true }
  );

  logger.info(`${total} conseillers synced to datalake`);
});
