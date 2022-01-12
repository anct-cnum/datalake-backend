#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');
const { encrypt } = require('../../utils/encrypt');
const dayjs = require('dayjs');
const dayOfYear = require('dayjs/plugin/dayOfYear');
dayjs.extend(dayOfYear);

execute(__filename, async ({ logger, db, dbDatalake }) => {
  const conseillers = await db.collection('conseillersSupprimes').find({}).toArray();
  let count = 0;
  const promises = [];
  conseillers.forEach(conseillerSupprime => {
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
        'userCreationError'
      ];

      for (const property in conseillerSupprime.conseiller) {
        if (!whitelist.includes(property)) {
          delete conseillerSupprime.conseiller[property];
        }
      }

      conseillerSupprime._id = encrypt(conseillerSupprime._id.toString());
      conseillerSupprime.conseiller._id = encrypt(conseillerSupprime.conseiller._id.toString());
      if (conseillerSupprime.conseiller.cv) {
        conseillerSupprime.conseiller.cv.file = encrypt(conseillerSupprime.conseiller.cv.file);
      }
      delete conseillerSupprime.conseiller.pix?.datePartage;
      if (conseillerSupprime.conseiller.dateDeNaissance !== undefined) {
        conseillerSupprime.conseiller.dateDeNaissance = dayjs(conseillerSupprime.conseiller.dateDeNaissance).dayOfYear(1).toDate();
      }

      delete conseillerSupprime.actionUser;

      await dbDatalake.collection('conseillersSupprimes').updateOne({ _id: conseillerSupprime._id }, { $set: conseillerSupprime }, { upsert: true });
      resolve();
    }));
  });
  await Promise.all(promises);
  logger.info(`${count} conseillersSupprimes synced to datalake`);
});
