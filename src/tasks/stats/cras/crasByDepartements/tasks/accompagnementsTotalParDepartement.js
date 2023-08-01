
const getAccompagnementsTotal = dbDatalake => async query =>
  await dbDatalake.collection('cras').countDocuments(query);

module.exports = { getAccompagnementsTotal };
