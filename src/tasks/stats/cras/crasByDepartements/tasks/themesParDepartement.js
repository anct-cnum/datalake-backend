const getThemesParDepartement = dbDatalake => async query => {

  let themes = await dbDatalake.collection('cras').aggregate(
    [
      { $unwind: '$cra.themes' },
      { $match: { ...query } },
      { $group: { _id: '$cra.themes', count: { $sum: 1 } } },
      { $project: { '_id': 0, 'nom': '$_id', 'valeur': '$count' } }
    ],
    { allowDiskUse: true }
  ).toArray();
  const thematiques = {};
  themes.forEach(theme => {
    thematiques[theme.nom] = theme.valeur;
  });

  let sousThemes = await dbDatalake.collection('cras').aggregate(
    [
      { $unwind: '$cra.sousThemes' },
      { $match: { ...query } },
      { $group: { _id: '$cra.sousThemes', count: { $sum: 1 } } },
      { $project: { '_id': 0, 'nom': '$_id', 'valeur': '$count' } }
    ],
    { allowDiskUse: true }
  ).toArray();

  return { 'themes': thematiques, sousThemes };
};

module.exports = { getThemesParDepartement };
