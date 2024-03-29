#!/usr/bin/env node
'use strict';

require('dotenv').config();

const { execute } = require('../utils');
const moment = require('moment');
const { getToken, apiCallPOST } = require('../../utils/metabase');

execute(__filename, async ({ logger, exit, app, dbDatalake }) => {

  if (app.get('metabase_pix').endPoint === 'none') {
    logger.info('Metabase pix non configuré sur la PF');
    return;
  }

  try {
    const metabase = app.get('metabase_pix');

    const cards = [
      {
        name: 'totalOrgas',
        path: '/api/card/3190/query'
      },
      {
        name: 'totalOrgasActivees',
        path: '/api/card/3189/query'
      },
      {
        name: 'totalOrgasAyantLanceDesCampagnes',
        path: '/api/card/3191/query'
      },
      {
        name: 'totalParticipants',
        path: '/api/card/3370/query'
      },
      {
        name: 'totalCampagnes',
        path: '/api/card/3371/query'
      }
    ];

    const token = await getToken({ metabase, login: metabase.login, password: metabase.password, logger });

    let stats = {};

    for (const card of cards) {
      const r = await apiCallPOST({ metabase, token, path: card.path, data: { parameters: [] }, logger });
      stats[card.name] = r?.data?.rows[0][0];
    }

    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    const key = moment(date).format('DD/MM/YYYY');

    const statsPIX = ({ 'key': key, 'date': date, 'data': stats });
    dbDatalake.collection('stats_externes_pix').insertOne(statsPIX);
  } catch (e) {
    logger.error(e);
  }
  exit();
});
