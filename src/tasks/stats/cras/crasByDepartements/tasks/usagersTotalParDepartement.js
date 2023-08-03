
const getUsagersTotal = dbDatalake => async query => await dbDatalake.collection('cras').aggregate([
  { $match: { ...query } },
  { $group: { _id: null, count: { $sum: '$cra.nbParticipants' }, countRec: { $sum: '$cra.nbParticipantsRecurrents' } } },
  { $project: { '_id': 0, 'usagers': '$count', 'recurrents': '$countRec' } }
],
{ allowDiskUse: true }
).toArray();

module.exports = { getUsagersTotal };
