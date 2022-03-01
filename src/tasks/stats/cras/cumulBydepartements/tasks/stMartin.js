const getStatsStMartin = async dbDatalake => {

  await dbDatalake.collection('cras').aggregate(
    [
      { $match: { 'cra.codePostal': { $eq: '97150' } } },
      { $group: { _id: {
        departement: '97150', //on taggue donc ici en 97150
      },
      count: { $sum: '$cra.nbParticipants' } } },
      { $project: { 'departement': '$departement', 'valeur': '$count' } },
      { $out: 'temporary_stmartin_departements_cras_cumul' }
    ]
  ).toArray(); //besoin du toArray même avec $out pour l'iteration du curseur mais renverra un tableau vide

};

module.exports = { getStatsStMartin };
