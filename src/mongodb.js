const MongoClient = require('mongodb').MongoClient;

module.exports = function(app) {
  const connection = app.get('mongodb');
  const connectionOptions = {
    useUnifiedTopology: true,
    monitorCommands: app.get('mongodb_monitor_commands'),
    loggerLevel: app.get('mongodb_logger_level'),
  };
  const database = connection.substr(connection.lastIndexOf('/') + 1);
  const mongoClient = MongoClient.connect(connection, connectionOptions)
  .then(client => client.db(database));

  app.set('mongoClient', mongoClient);
};
