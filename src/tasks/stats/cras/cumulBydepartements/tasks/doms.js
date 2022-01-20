const getStatsDoms = async db => {

  await db.collection('cras').aggregate(
    [
      { $match: {
        $and: [
          { 'cra.codePostal': { $regex: /(?:^97)|(?:^98)/ } },
          { 'cra.codePostal': { $ne: '97150' } },
        ] } },
      { $group: { _id: {
        departement: { $substr: ['$cra.codePostal', 0, 3] }, //ici on prend les 3 premiers chiffres du DOM
      },
      count: { $sum: '$cra.nbParticipants' } } },
      { $project: { 'departement': '$departement', 'valeur': '$count' } },
      { $out: 'temporary_doms_stats_departements_cras_cumul' }
    ]
  ).toArray(); //besoin du toArray même avec $out pour l'iteration du curseur mais renverra un tableau vide

};

module.exports = { getStatsDoms };
