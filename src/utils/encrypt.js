const crypto = require('crypto');

const encrypt = data => {
  return crypto.createHash('sha256').update(data).digest('base64');
};
  
module.exports = { encrypt };
