const getListDepsFormatted = async (dbDatalake, departements) => {

  const depsList = new Map();
  //Insertion des stats par département
  for (const departement of departements) {
    let statDep;
    //CAS DOMs
    // eslint-disable-next-line max-len
    if ((departement['num_dep'].toString().startsWith('97') || departement['num_dep'].toString().startsWith('98')) && !departement['num_dep'].toString().startsWith('97150')) {
      statDep = await dbDatalake.collection('temporary_doms_stats_departements_cras_cumul').findOne({ '_id.departement': departement['num_dep'].toString() });
    //CAS CORSE 2A
    } else if (departement['num_dep'].toString().startsWith('2A')) {
      statDep = await dbDatalake.collection('temporary_corse2a_stats_departements_cras_cumul').findOne({ '_id.departement': departement['num_dep'].toString() });
    //CAS CORSE 2B
    } else if (departement['num_dep'].toString().startsWith('2B')) {
      statDep = await dbDatalake.collection('temporary_corse2b_stats_departements_cras_cumul').findOne({ '_id.departement': departement['num_dep'].toString() });
    } else {
    //CAS NORMAL
      statDep = await dbDatalake.collection('temporary_others_stats_departements_cras_cumul').findOne({ '_id.departement': departement['num_dep'].toString() });
    }

    departement['count'] = statDep?.valeur ?? 0;
    depsList.set(String(departement.num_dep), departement);
  }

  //CAS TOMs (manuel car ne sont pas réellement des départements et ne font donc pas partis de la liste departements)
  let statDepStMartin = await dbDatalake.collection('temporary_stmartin_departements_cras_cumul').findOne({ '_id.departement': '97150' });
  let stMartin = {
    num_dep: 978,
    dep_name: 'Saint-Martin',
    region_name: 'Saint-Martin',
    count: statDepStMartin?.valeur ?? 0
  };
  depsList.set(String(978), stMartin);

  let statDepNouvelleCaldonie = await dbDatalake.collection('temporary_doms_stats_departements_cras_cumul').findOne({ '_id.departement': '988' });
  let nouvelleCaledonie = {
    num_dep: 988,
    dep_name: 'Nouvelle-Calédonie',
    region_name: 'Nouvelle-Calédonie',
    count: statDepNouvelleCaldonie?.valeur ?? 0
  };
  depsList.set(String(988), nouvelleCaledonie);

  return depsList;

};

module.exports = { getListDepsFormatted };
