const axios = require('axios');

const getToken = async ({ metabase, login, password, logger }) => {
  try {
    const result = await axios({
      method: 'post',
      url: `${metabase.endPoint}/api/session`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { 'username': login, 'password': password }
    });
    return result?.data?.id;
  } catch (e) {
    logger.error(e);
    return false;
  }
};

const apiCallGET = async ({ metabase, token, path, logger }) => {
  try {
    const result = await axios({
      method: 'get',
      url: `${metabase.endPoint}${path}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Metabase-Session': token
      }
    });
    return result?.data;
  } catch (e) {
    logger.error(e);
    return false;
  }
};

const apiCallPOST = async ({ metabase, token, path, data, logger }) => {
  try {
    const result = await axios({
      method: 'post',
      url: `${metabase.endPoint}${path}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Metabase-Session': token
      },
      data
    });
    return result?.data;
  } catch (e) {
    logger.error(e);
    return false;
  }
};

module.exports = { getToken, apiCallGET, apiCallPOST };
