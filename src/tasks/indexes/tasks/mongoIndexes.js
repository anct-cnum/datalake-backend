module.exports = {
  structures: db => {
    return Promise.all([
      db.collection('structures').createIndex({ 'createdAt': -1 }),
      db.collection('structures').createIndex({ 'type': 1 }),
      db.collection('structures').createIndex({ 'statut': 1 }),
      db.collection('structures').createIndex({ 'codeDepartement': 1 }),
      db.collection('structures').createIndex({ 'codePostal': 1 }),
      db.collection('structures').createIndex({ 'codeRegion': 1 }),
      db.collection('structures').createIndex({ 'userCreated': 1 }),
      db.collection('structures').createIndex({ 'prefet.avisPrefet': 1 }),
      db.collection('structures').createIndex({ 'coselec.avisCoselec': 1 }),
      db.collection('structures').createIndex({ 'reseau': 1 })
    ]);
  },
  conseillers: db => {
    return Promise.all([
      db.collection('conseillers').createIndex({ 'codeDepartement': 1 }),
      db.collection('conseillers').createIndex({ 'codeRegion': 1 }),
      db.collection('conseillers').createIndex({ 'location': '2dsphere' }),
      db.collection('conseillers').createIndex({ 'cv.date': 1 }),
      db.collection('conseillers').createIndex({ 'statut': 1 }),
      db.collection('conseillers').createIndex({ 'userCreated': 1 }),
      db.collection('conseillers').createIndex({ 'userCreationError': 1 }),
      db.collection('conseillers').createIndex({ 'estRecrute': 1 }),
      db.collection('conseillers').createIndex({ 'dateFinFormation': 1 })
    ]);
  },
  cras: db => {
    return Promise.all([
      db.collection('cras').createIndex({ 'conseiller.$id': 1 }),
      db.collection('cras').createIndex({ 'createdAt': 1 }),
      db.collection('cras').createIndex({ 'cra.duree': 1 }),
      db.collection('cras').createIndex({ 'cra.codePostal': 1 }),
    ]);
  },
  stats_filtres: db => {
    return Promise.all([
      db.collection('stats_filtres').createIndex({ 'codeDepartement': 1 }),
      db.collection('stats_filtres').createIndex({ 'departement': 1 }),
      db.collection('stats_filtres').createIndex({ 'region': 1 }),
      db.collection('stats_filtres').createIndex({ 'data.numeroDepartement': 1 }),
      db.collection('stats_filtres').createIndex({ 'data.departement': 1 }),
      db.collection('stats_filtres').createIndex({ 'data.region': 1 })
    ]);
  },
  stats_PostesValidesDepartement: db => {
    return Promise.all([
      db.collection('stats_PostesValidesDepartement').createIndex({ 'date': 1 }, { unique: true }),
      db.collection('stats_PostesValidesDepartement').createIndex({ 'data.numeroDepartement': 1 }),
      db.collection('stats_PostesValidesDepartement').createIndex({ 'data.region': 1 })
    ]);
  },
  stats_ConseillersEnPosteDepartement: db => {
    return Promise.all([
      db.collection('stats_ConseillersEnPosteDepartement').createIndex({ 'date': 1 }, { unique: true }),
      db.collection('stats_ConseillersEnPosteDepartement').createIndex({ 'data.numeroDepartement': 1 }),
      db.collection('stats_ConseillersEnPosteDepartement').createIndex({ 'data.region': 1 })
    ]);
  },
  stats_ConseillersEnFormationDepartement: db => {
    return Promise.all([
      db.collection('stats_ConseillersEnFormationDepartement').createIndex({ 'date': 1 }, { unique: true }),
      db.collection('stats_ConseillersEnFormationDepartement').createIndex({ 'data.numeroDepartement': 1 }),
      db.collection('stats_ConseillersEnFormationDepartement').createIndex({ 'data.region': 1 })
    ]);
  },
  stats_ConseillersRecrutesDepartement: db => {
    return Promise.all([
      db.collection('stats_ConseillersRecrutesDepartement').createIndex({ 'date': 1 }, { unique: true }),
      db.collection('stats_ConseillersRecrutesDepartement').createIndex({ 'data.numeroDepartement': 1 }),
      db.collection('stats_ConseillersRecrutesDepartement').createIndex({ 'data.region': 1 })
    ]);
  },
  stats_ConseillersFinalisesDepartement: db => {
    return Promise.all([
      db.collection('stats_ConseillersFinalisesDepartement').createIndex({ 'date': 1 }, { unique: true }),
      db.collection('stats_ConseillersFinalisesDepartement').createIndex({ 'data.numeroDepartement': 1 }),
      db.collection('stats_ConseillersFinalisesDepartement').createIndex({ 'data.region': 1 })
    ]);
  },
  stats_StructuresCandidates: db => {
    return Promise.all([
      db.collection('stats_StructuresCandidates').createIndex({ 'date': 1 }, { unique: true }),
      db.collection('stats_StructuresCandidates').createIndex({ 'data.numeroDepartement': 1 }),
      db.collection('stats_StructuresCandidates').createIndex({ 'data.region': 1 })
    ]);
  },
  stats_StructuresValidees: db => {
    return Promise.all([
      db.collection('stats_StructuresValidees').createIndex({ 'idStructure': 1 }, { unique: true }),
      db.collection('stats_StructuresValidees').createIndex({ 'estGrandReseau': 1 }),
      db.collection('stats_StructuresValidees').createIndex({ 'codeDepartement': 1 }),
      db.collection('stats_StructuresValidees').createIndex({ 'region': 1 })
    ]);
  },
};
