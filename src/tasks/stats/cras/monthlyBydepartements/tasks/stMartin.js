const getStatsStMartin = async (db, query) => {

  await db.collection('cras').aggregate(
    [
      { $match: { ...query, 'cra.codePostal': { $eq: '97150' } } },
      { $group: { _id: {
        departement: '97150', //on taggue donc ici en 97150
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' } },
      count: { $sum: '$cra.nbParticipants' } } },
      { $project: { 'departement': '$departement', 'mois': '$month', 'annee': '$year', 'valeur': '$count' } },
      { $out: 'temporary_stmartin_departements_cras' }
    ]
  ).toArray(); //besoin du toArray même avec $out pour l'iteration du curseur mais renverra un tableau vide

};

module.exports = { getStatsStMartin };
