const getStatsAllOthers = async dbDatalake => {

  await dbDatalake.collection('cras').aggregate(
    [
      { $match: {
        $and: [
          { 'cra.codePostal': { $not: /(?:^97)|(?:^98)/ } }, // On enlève tous les cas particuliers
          { 'cra.codePostal': { $not: /(?:^20)/ } },
        ] } },
      { $group: { _id: {
        departement: { $substr: ['$cra.codePostal', 0, 2] }, //On prend les 2 premiers chiffres du CP
      },
      count: { $sum: '$cra.nbParticipants' } } },
      { $project: { 'departement': '$departement', 'valeur': '$count' } },
      { $out: 'temporary_others_stats_departements_cras_cumul' }
    ]
  ).toArray(); //besoin du toArray même avec $out pour l'iteration du curseur mais renverra un tableau vide

};

module.exports = { getStatsAllOthers };
