#!/usr/bin/env node
'use strict';
require('dotenv').config();
const cli = require('commander');
const dayjs = require('dayjs');
const awsUtils = require('../../utils/aws');
const utils = require('../../utils/index');

const { execute } = require('../utils');

cli.description('Export structures validées en Coselec pour le projet SIT')
.helpOption('-e', 'HELP command')
.parse(process.argv);

execute(__filename, async ({ logger, app, dbDatalake }) => {
  logger.info(`Début de préparation des données structures...`);
  const query = { statut: 'VALIDATION_COSELEC' };
  const structures = await dbDatalake.collection('structures').find(query).toArray();

  let promises = [];
  const structuresTransformees = [];

  structures.forEach(structure => {
    promises.push(new Promise(async resolve => {
      try {
        structure.dernierCoselec = utils.getCoselec(structure); // Cherche le bon Coselec
        delete structure.contact;
        delete structure.prefet;

        // Récupération des stats associées
        const stats = await dbDatalake.collection('stats_StructuresValidees').findOne({ idStructure: structure._id });
        structure.stats = {
          investissementEstimatifEtat: stats?.investissementEstimatifEtat ?? '?',
          nbConseillersEnFormation: stats?.nbConseillersEnFormation ?? '?',
          nbConseillersEnPoste: stats?.nbConseillersEnPoste ?? '?',
          nbConseillersFinalisees: stats?.nbConseillersFinalisees ?? '?',
          nbConseillersRecrutees: stats?.nbConseillersRecrutees ?? '?'
        };

        structuresTransformees.push(structure);
      } catch (e) {
        logger.error(`Une erreur est survenue sur la structure idPG=${structure.idPG} : ${e}`);
      }
      resolve();
    }));
  });
  await Promise.all(promises);

  logger.info(`Préparation des données structures : OK`);

  await new Promise(async (resolve, reject) => {
    const today = dayjs(new Date()).format('YYYY-MM-DD');
    const s3 = awsUtils.initAWS(app.get('aws'));
    const params = {
      Bucket: app.get('aws').sit_bucket,
      Key: `structures_sit_${today}.ndjson`,
      Body: structuresTransformees.map(JSON.stringify).join('\n'), //ndjson
      ContentType: 'application/x-ndjson',
      ACL: 'public-read'
    };

    logger.info(`Upload du fichier structures sur S3 en cours...`);

    s3.upload(params, (S3error, data) => {
      if (S3error) {
        logger.error(`Erreur export du fichier structures SIT sur S3 : ${S3error}`);
        reject(S3error);
        return;
      }
      logger.info(`Fichier structures SIT déposé sur S3 avec ${structuresTransformees.length} structures validées Coselec`);
      resolve(data);
    });
  });
});
