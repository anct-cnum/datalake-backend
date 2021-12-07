const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const config = configuration();
const express = require('@feathersjs/express');

const middleware = require('../middleware');
const services = require('../services');
const appHooks = require('../app.hooks');
const channels = require('../channels');

const mongodb = require('../mongodb');
const mongoClientDatalake = require('../mongodbDatalake');

const f = feathers();
const app = express(f);

app.configure(config);
app.configure(mongodb);
app.configure(mongoClientDatalake);
app.configure(middleware);
app.configure(services);
app.configure(channels);
app.hooks(appHooks);

const logger = require('../logger');

let transaction = null;

module.exports = {
  delay: milliseconds => {
    return new Promise(resolve => setTimeout(() => resolve(), milliseconds));
  },
  capitalizeFirstLetter: string => string.charAt(0).toUpperCase() + string.slice(1),
  execute: async (name, job) => {
    process.on('unhandledRejection', e => logger.error(e));
    process.on('uncaughtException', e => logger.error(e));

    const exit = async error => {
      if (error) {
        logger.error(error);
        process.exitCode = 1;
      }
      if (transaction !== null) {
        transaction.finish();
      }
      setTimeout(() => {
        process.exit();
      }, 1000);
    };

    const db = await app.get('mongoClient');
    const dbDatalake = await app.get('mongoClientDatalake');

    let jobComponents = Object.assign({}, { feathers: f, db, dbDatalake, logger, exit, app });

    try {
      let launchTime = new Date().getTime();
      await job(jobComponents);
      let duration = dayjs.utc(new Date().getTime() - launchTime).format('HH:mm:ss.SSS');
      console.log(`Completed in ${duration}`);
      exit();
    } catch (e) {
      exit(e);
    }
  },
};
