const getUsagersUniques = dbDatalake => async (usagers, query) => {

  const getRecurents = await dbDatalake.collection('cras').aggregate([
    { $match: { ...query } },
    { $group: { _id: null, count: { $sum: '$cra.nbParticipantsRecurrents' } } },
    { $project: { '_id': 0, 'valeur': '$count' } }
  ]).toArray();

  const recurents = getRecurents[0]?.valeur ?? 0;
  return usagers - recurents;
};

module.exports = { getUsagersUniques };
