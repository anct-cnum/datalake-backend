#!/usr/bin/env node
'use strict';
const path = require('path');
const fs = require('fs');
const { program } = require('commander');
const { execute } = require('../utils');

require('dotenv').config();

// Penser à réaliser la commande avec --max-old-space-size=8192
// pour traiter la quantité de données sans problème de mémoire
execute(__filename, async ({ logger, dbDatalake }) => {
  program.helpOption('-e', 'HELP command');
  program.parse(process.argv);

  const cras = await dbDatalake.collection('cras').find().toArray();
  const promises = [];
  logger.info(`Generating CSV file...`);
  let csvFile = path.join(__dirname, '../../../data/exports', `cras.csv`);
  let file = fs.createWriteStream(csvFile, { flags: 'w' });

  file.write(`ID,ConseillerId,Cra,CreatedAt,UpdatedAt,PermanenceId,StructureId\n`);
  cras.forEach(cra => {
    promises.push(new Promise(async resolve => {
      file.write(`${cra._id},${cra.conseillerId},${cra.cra},${cra.createdAt},${cra.updatedAt},${cra.permanenceId},${cra.structureId},\n`);
      resolve();
    }));
  });
  await Promise.all(promises);
  file.close();
});
