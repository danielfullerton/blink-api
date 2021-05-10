import * as AWS from 'aws-sdk';

export const init = () => {
  AWS.config.update({
    region: 'us-east-2',
    credentials: {
      accessKeyId: process.env.KEY,
      secretAccessKey: process.env.SECRET
    }
  });
};
