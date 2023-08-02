#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const { execute } = require('../../../utils');
const dayjs = require('dayjs');

const departements = require('../../../../../data/departements-region.json');
const statsAlltasks = require('./tasks');

program.description('Statistiques CRAs par département : ')
.option('-nd, --noDate <noDate>', 'Without date limit')
.helpOption('-e', 'HELP command')
.parse(process.argv);

const findAndInsertStats = async (dbDatalake, query, departement) => {
  const totalAccompagnements = await statsAlltasks.getAccompagnementsTotal(dbDatalake)(query);
  const usagersTotalParDepartement = await statsAlltasks.getUsagersTotal(dbDatalake)(query);
  const usagersUniquesParDepartement = await statsAlltasks.getUsagersUniques(dbDatalake)(usagersTotalParDepartement[0]?.usagers ?? 0, query);
  const agesParDepartement = await statsAlltasks.getAgesParDepartement(dbDatalake)(query);
  const statutsParDepartement = await statsAlltasks.getStatutsParDepartement(dbDatalake)(query);
  const themesParDepartement = await statsAlltasks.getThemesParDepartement(dbDatalake)(query);

  const statsOutilPrefet = {
    'dep_name': departement.dep_name,
    'num_dep': departement.num_dep,
    'region': departement.region_name,
    'nombre_accompagnements': totalAccompagnements ?? 0,
    'nombre_usagers': usagersTotalParDepartement[0]?.usagers ?? 0,
    'nombre_usagers_uniques': usagersUniquesParDepartement,
    'repartition_ages': agesParDepartement,
    'repartition_statuts': statutsParDepartement,
    'repartition_thematiques': themesParDepartement.themes,
    'repartition_sous_thematiques': themesParDepartement.sousThemes,
  };

  await statsAlltasks.insertStatsOutilPrefet(dbDatalake)(statsOutilPrefet);
};

execute(__filename, async ({ logger, dbDatalake }) => {
  const { noDate } = program._optionValues;
  const promises = [];
  const datePremierCra = dayjs(new Date('2021-07-12 00:00:00')).toDate();
  const dateDebut = dayjs().subtract(1, 'day').utcOffset(0).startOf('date').toDate();
  const dateFin = dayjs().subtract(1, 'day').utcOffset(0).endOf('date').toDate();

  try {
    departements.forEach(departement => {
      promises.push(new Promise(async resolve => {
        let regex = '^' + departement.num_dep;
        //cas particuliers du fichier departements/regions
        if (departement.num_dep === '2A') {
          regex = '^(?:^200)|(?:^201)';
        }
        if (departement.num_dep === '2B') {
          regex = '^(?:^202)|(?:^206)';
        }
        if (departement.num_dep === '971') {
          regex = '^971[^5]';
        }

        const query = {
          //Lorsque les codeCommune seront importer => 'cra.codeCommune': { $regex: new RegExp(regex) },
          'cra.codePostal': { $regex: new RegExp(regex) },
          'createdAt': { '$gte': noDate ? datePremierCra : dateDebut, '$lte': dateFin }
        };
        await findAndInsertStats(dbDatalake, query, departement);
        resolve();
      }));
    });

    await Promise.all(promises);

    //Exception de Saint Martin
    const query = {
      //Lorsque les codeCommune seront importer => 'cra.codeCommune': { $regex: new RegExp(regex) },
      'cra.codePostal': '97150',
      'createdAt': { '$gte': noDate ? datePremierCra : dateDebut, '$lte': dateFin }
    };
    const departementSaintMartin = {
      dep_name: 'Saint-Martin',
      num_dep: '978',
      region_name: 'Saint-Martin',
    };
    await findAndInsertStats(dbDatalake, query, departementSaintMartin);

  } catch (error) {
    logger.error(error);
  }
});
