#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');

execute(__filename, async ({ logger, dbDatalake }) => {
  const countConseillersSupprimes = await dbDatalake.collection('conseillersSupprimes').countDocuments({});
  const countConseillers = await dbDatalake.collection('conseillers').countDocuments({});
  const total = countConseillersSupprimes + countConseillers;

  await dbDatalake.collection('conseillersTotal').updateOne(
    { },
    { $set: { totalConseillers: total } },
    { upsert: true }
  );

  logger.info(`${total} conseillers synced to datalake`);
});
