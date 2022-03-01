const getStatsCorse2B = async dbDatalake => {

  await dbDatalake.collection('cras').aggregate(
    [
      { $match: { 'cra.codePostal': { $regex: /(?:^202)|(?:^206)/ } } },
      { $group: { _id: {
        departement: '2B', //ici on passe en 2B
      },
      count: { $sum: '$cra.nbParticipants' } } },
      { $project: { 'departement': '$departement', 'valeur': '$count' } },
      { $out: 'temporary_corse2b_stats_departements_cras_cumul' }
    ]
  ).toArray(); //besoin du toArray même avec $out pour l'iteration du curseur mais renverra un tableau vide

};

module.exports = { getStatsCorse2B };
