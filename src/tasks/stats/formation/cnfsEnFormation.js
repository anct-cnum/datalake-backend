const getCnfsFormation = async (db, logger, addTomStMartin, key, date, departements) => {
  //Nombre de conseillers en formation par département
  const conseillersEnFormation = await db.collection('conseillers').find({
    statut: { $eq: 'RECRUTE' },
    structureId: { $ne: null },
    $and: [
      { dateFinFormation: { $ne: null } },
      { dateFinFormation: { $gte: new Date() } }
    ]
  }).toArray();
  let promisesConseillers = [];
  let lignes = [];
  conseillersEnFormation?.forEach(conseiller => {
    promisesConseillers.push(new Promise(async resolve => {
      try {
        const { codeDepartement, codeCom } = await db.collection('structures').findOne({ _id: conseiller.structureId });
        if (lignes.findIndex(dep => dep.numeroDepartement === codeCom) !== -1) {
          ++lignes[lignes.findIndex(dep => dep.numeroDepartement === codeCom)].nombreConseillersEnFormation;
        } else if (lignes.findIndex(dep => dep.numeroDepartement === codeDepartement) !== -1) {
          ++lignes[lignes.findIndex(dep => dep.numeroDepartement === codeDepartement)].nombreConseillersEnFormation;
        } else if (codeCom === '978') {
          addTomStMartin(1, lignes, 'nombreConseillersEnFormation');
        } else {
          lignes.push({
            'numeroDepartement': codeDepartement,
            'departement': departements.find(dep => String(dep.num_dep) === String(codeDepartement))?.dep_name,
            'region': departements.find(dep => String(dep.num_dep) === String(codeDepartement))?.region_name,
            'nombreConseillersEnFormation': 1
          });
        }
      } catch (error) {
        logger.error(error);
      }
      resolve();
    }));
  });

  await Promise.all(promisesConseillers);
  const conseillersEnFormationDepartement = ({ 'key': key, 'date': new Date(date), 'data': lignes });

  return conseillersEnFormationDepartement;
};

module.exports = { getCnfsFormation };
