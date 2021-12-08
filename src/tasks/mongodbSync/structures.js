#!/usr/bin/env node
'use strict';

const { execute } = require('../utils');
const { encrypt } = require('../../utils/encrypt');

execute(__filename, async ({ logger, db, dbDatalake }) => {
  const structures = await db.collection('structures').find({}).toArray();
  let count = 0;
  const promises = [];
  structures.forEach(structure => {
    promises.push(new Promise(async resolve => {
      count++;

      const whitelist = [
        "_id",
        "aIdentifieCandidat",
        "codeCom",
        "codeCommune",
        "codeDepartement",
        "codePostal",
        "codeRegion",
        "contact",
        "coordonneesInsee",
        "coselec",
        "coselecAt",
        "createdAt",
        "dateDebutMission",
        "deleted_at",
        "emailConfirmedAt",
        "estLabelliseFranceServices",
        "estZRR",
        "importedAt",
        "insee",
        "location",
        "nom",
        "nomCommune",
        "nombreConseillersSouhaites",
        "prefet",
        "qpvListe",
        "qpvStatut",
        "siret",
        "statut",
        "type",
        "unsubscribeExtras",
        "unsubscribedAt",
        "updatedAt",
        "userCreated",
        "validatedAt"
      ];

      for (const property in structure) {
        if(!whitelist.includes(property)) {
          delete structure[property];
        }
      }

      structure._id = encrypt(structure._id.toString());

      await dbDatalake.collection('structures').updateOne({ _id: structure._id }, { $set: structure }, { upsert: true });
      resolve();
    }));
  });
  await Promise.all(promises);
  logger.info(`${count} structures synced to datalake`);
});
