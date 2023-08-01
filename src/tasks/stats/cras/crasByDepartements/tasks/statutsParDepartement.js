const getStatutsParDepartement = dbDatalake => async query => await dbDatalake.collection('cras').aggregate(
  [
    { $match: { ...query } },
    { $group: {
      _id: 'statut',
      etudiant: { $sum: '$cra.statut.etudiant' },
      sansEmploi: { $sum: '$cra.statut.sansEmploi' },
      enEmploi: { $sum: '$cra.statut.enEmploi' },
      retraite: { $sum: '$cra.statut.retraite' },
      heterogene: { $sum: '$cra.statut.heterogene' },
    } },
    { $project: { '_id': 0, 'etudiant': '$etudiant',
      'sansEmploi': '$sansEmploi', 'enEmploi': '$enEmploi',
      'retraite': '$retraite', 'heterogene': '$heterogene'
    } }
  ]
).toArray();

module.exports = { getStatutsParDepartement };
