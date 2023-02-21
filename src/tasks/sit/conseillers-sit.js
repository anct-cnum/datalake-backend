#!/usr/bin/env node
'use strict';
require('dotenv').config();
const cli = require('commander');
const dayjs = require('dayjs');
const awsUtils = require('../../utils/aws');

const { execute } = require('../utils');

cli.description('Export conseillers recrutés pour le projet SIT')
.helpOption('-e', 'HELP command')
.parse(process.argv);

execute(__filename, async ({ logger, app, dbDatalake }) => {

  if (app.get('aws').endpoint === 'none') {
    logger.info('AWS non configuré sur la PF');
    return;
  }

  await new Promise(async (resolve, reject) => {
    logger.info(`Début de préparation des données conseillers...`);
    const today = dayjs(new Date()).format('YYYY-MM-DD');
    const query = { statut: 'RECRUTE' };
    const conseillers = await dbDatalake.collection('conseillers').find(query).toArray();

    logger.info(`Préparation des données conseillers : OK`);

    const s3 = awsUtils.initAWS(app.get('aws'));
    const params = {
      Bucket: app.get('aws').sit_bucket,
      Key: `cnfs_sit_${today}.ndjson`,
      Body: conseillers.map(JSON.stringify).join('\n'), //ndjson
      ContentType: 'application/x-ndjson',
      ACL: 'public-read'
    };

    logger.info(`Upload du fichier cnfs sur S3 en cours...`);

    s3.upload(params, (S3error, data) => {
      if (S3error) {
        logger.error(`Erreur export du fichier cnfs SIT sur S3 : ${S3error}`);
        reject(S3error);
        return;
      }
      logger.info(`Fichier cnfs SIT déposé sur S3 avec ${conseillers.length} conseiller(s) récruté(s)`);
      resolve(data);
    });
  });
});
