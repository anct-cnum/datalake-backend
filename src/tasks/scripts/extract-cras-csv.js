#!/usr/bin/env node
'use strict';
const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const { execute } = require('../utils');

require('dotenv').config();

execute(__filename, async ({ logger, dbDatalake }) => {
  program.helpOption('-e', 'HELP command');
  program.parse(process.argv);

  const cursor = await dbDatalake.collection('cras').find();

  logger.info(`Generating CSV file...`);
  let csvFile = path.join(__dirname, '../../../data/exports', `cras.csv`);
  let file = fs.createWriteStream(csvFile, { flags: 'w' });

  file.write(`ID;ConseillerId;Cra;CreatedAt;UpdatedAt;PermanenceId;StructureId\n`);
  while (await cursor.hasNext()) {
    const cra = await cursor.next();
    file.write(`${cra._id};${cra.conseillerId};${JSON.stringify(cra.cra)};${cra.createdAt};${cra.updatedAt};${cra.permanenceId};${cra.structureId};\n`);
  }

  file.close();
});
