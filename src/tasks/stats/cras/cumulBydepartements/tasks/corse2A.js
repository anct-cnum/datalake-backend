const getStatsCorse2A = async db => {

  await db.collection('cras').aggregate(
    [
      { $match: { 'cra.codePostal': { $regex: /(?:^200)|(?:^201)/ } } },
      { $group: { _id: {
        departement: '2A', //ici on passe en 2A
      },
      count: { $sum: '$cra.nbParticipants' } } },
      { $project: { 'departement': '$departement', 'valeur': '$count' } },
      { $out: 'temporary_corse2a_stats_departements_cras_cumul' }
    ]
  ).toArray(); //besoin du toArray même avec $out pour l'iteration du curseur mais renverra un tableau vide

};

module.exports = { getStatsCorse2A };
