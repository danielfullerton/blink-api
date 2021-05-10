import * as AWS from 'aws-sdk';
import { SendEmailRequest } from 'aws-sdk/clients/ses';

const defaultSubject = 'New Blink API Alert';

export const email = (text: string, subject = defaultSubject) => {
  const emailParams: SendEmailRequest = {
    Destination: {
      ToAddresses: ['dan.frank.fullerton@gmail.com']
    },
    Message: {
      Body: {
        Text: {
          Data: text
        }
      },
      Subject: {
        Data: subject
      }
    },
    Source: 'dan.frank.fullerton@gmail.com'
  };

  return new AWS.SES()
    .sendEmail(emailParams)
    .promise();
};
