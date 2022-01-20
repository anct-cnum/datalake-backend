const getStatsCorse2A = async (db, query) => {

  await db.collection('cras').aggregate(
    [
      { $match: { ...query, 'cra.codePostal': { $regex: /(?:^200)|(?:^201)/ } } },
      { $group: { _id: {
        departement: '2A', //ici on passe en 2A
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' } },
      count: { $sum: '$cra.nbParticipants' } } },
      { $project: { 'departement': '$departement', 'mois': '$month', 'annee': '$year', 'valeur': '$count' } },
      { $out: 'temporary_corse2a_stats_departements_cras' }
    ]
  ).toArray(); //besoin du toArray même avec $out pour l'iteration du curseur mais renverra un tableau vide

};

module.exports = { getStatsCorse2A };
