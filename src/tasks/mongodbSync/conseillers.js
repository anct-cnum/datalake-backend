#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');
const { encrypt } = require('../../utils/encrypt');
const dayjs = require('dayjs');
const dayOfYear = require('dayjs/plugin/dayOfYear');
dayjs.extend(dayOfYear);

execute(__filename, async ({ logger, db, dbDatalake }) => {
  const conseillers = await db.collection('conseillers').find({}).toArray();
  let count = 0;
  const promises = [];
  conseillers.forEach(conseiller => {
    promises.push(new Promise(async resolve => {
      count++;

      const whitelist = [
        '_id',
        'aUneExperienceMedNum',
        'codeCom',
        'codeCommune',
        'codeDepartement',
        'codePostal',
        'codeRegion',
        'createdAt',
        'dateDeNaissance',
        'dateDisponibilite',
        'dateFinFormation',
        'datePrisePoste',
        'deletedAt',
        'disponible',
        'distanceMax',
        'emailConfirmedAt',
        'estDemandeurEmploi',
        'estDiplomeMedNum',
        'estEnEmploi',
        'estEnFormation',
        'importedAt',
        'location',
        'nomCommune',
        'nomDiplomeMedNum',
        'pix',
        'sexe',
        'sondageSentAt',
        'statut',
        'unsubscribedAt',
        'updatedAt',
        'userCreated',
        'cv',
        'estRecrute',
        'userCreationError',
        'structureId'
      ];

      for (const property in conseiller) {
        if (!whitelist.includes(property)) {
          delete conseiller[property];
        }
      }

      conseiller._id = encrypt(conseiller._id.toString());
      if (conseiller.cv) {
        conseiller.cv.file = encrypt(conseiller.cv.file);
      }
      delete conseiller.pix?.datePartage;
      if (conseiller.dateDeNaissance !== undefined) {
        conseiller.dateDeNaissance = dayjs(conseiller.dateDeNaissance).dayOfYear(1).toDate();
      }

      if (conseiller.structureId !== undefined) {
        conseiller.structureId = encrypt(conseiller.structureId.toString());
      }

      await dbDatalake.collection('conseillers').replaceOne({ _id: conseiller._id }, conseiller, { upsert: true });
      resolve();
    }));
  });
  await Promise.all(promises);
  logger.info(`${count} conseillers synced to datalake`);
});
