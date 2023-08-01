
const getUsagersTotal = dbDatalake => async query => await dbDatalake.collection('cras').aggregate([
  { $match: { ...query } },
  { $group: { _id: null, count: { $sum: '$cra.nbParticipants' } } },
  { $project: { '_id': 0, 'usagers': '$count' } }
]).toArray();

module.exports = { getUsagersTotal };
