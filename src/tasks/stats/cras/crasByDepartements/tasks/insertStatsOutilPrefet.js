const insertStatsOutilPrefet = dbDatalake => async statsOutilPrefet =>
  await dbDatalake.collection('stats_departements_cras_details').replaceOne(
    { codeDepartement: statsOutilPrefet.num_dep },
    statsOutilPrefet,
    { upsert: true }
  );

module.exports = { insertStatsOutilPrefet };
