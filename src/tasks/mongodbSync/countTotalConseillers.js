#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');

execute(__filename, async ({ logger, db, dbDatalake }) => {
  const countConseillersSupprimes = await db.collection('conseillersSupprimes').countDocuments({});
  const countConseillers = await db.collection('conseillers').countDocuments({});
  const total = countConseillersSupprimes + countConseillers;

  const conseillersTotal = await dbDatalake.collection('conseillersTotal').find({}).toArray();

  await dbDatalake.collection('conseillersTotal').updateOne(
    { _id: conseillersTotal[0]?._id },
    { $set: { totalConseillers: total } },
    { upsert: true }
  );

  logger.info(`${total} conseillers synced to datalake`);
});
