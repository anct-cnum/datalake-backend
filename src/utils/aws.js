const aws = require('aws-sdk');

const initAWS = awsConfig => {
  aws.config.update({
    accessKeyId: awsConfig.access_key_id,
    secretAccessKey: awsConfig.secret_access_key,
    httpOptions: { timeout: Number(awsConfig.http_timeout) }
  });
  const ep = new aws.Endpoint(awsConfig.endpoint);
  const s3 = new aws.S3({ endpoint: ep });

  return s3;
};

module.exports = { initAWS };
