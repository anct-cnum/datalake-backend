const insertStatsOutilPrefet = dbDatalake => async statsOutilPrefet =>
  await dbDatalake.collection('stats_departements_cras_details').updateOne(
    { num_dep: statsOutilPrefet.num_dep },
    { $set: statsOutilPrefet },
    { upsert: true }
  );

module.exports = { insertStatsOutilPrefet };
