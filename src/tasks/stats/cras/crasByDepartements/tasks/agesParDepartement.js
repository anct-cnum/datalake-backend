const getAgesParDepartement = dbDatalake => async query => await dbDatalake.collection('cras').aggregate(
  [
    { $match: { ...query } },
    { $group: {
      _id: 'age',
      moins12ans: { $sum: '$cra.age.moins12ans' },
      de12a18ans: { $sum: '$cra.age.de12a18ans' },
      de18a35ans: { $sum: '$cra.age.de18a35ans' },
      de35a60ans: { $sum: '$cra.age.de35a60ans' },
      plus60ans: { $sum: '$cra.age.plus60ans' },
    } },
    { $project: { '_id': 0, 'moins12ans': '$moins12ans',
      'de12a18ans': '$de12a18ans', 'de18a35ans': '$de18a35ans',
      'de35a60ans': '$de35a60ans', 'plus60ans': '$plus60ans'
    } }
  ]
).toArray();

module.exports = { getAgesParDepartement };
