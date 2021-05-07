import axios from 'axios';
import { v4 } from 'uuid';
import to from 'await-to-js';
import * as express from 'express';
const app = express();

const BASE_URL = 'rest-prod.immedia-semi.com';
const LOGIN_ENDPOINT = '/api/v5/account/login';
const VERIFY_ENDPOINT = '/api/v4/account/{ACCOUNT_ID}/client/{CLIENT_ID}/pin/verify';

const email = 'dan.frank.fullerton@gmail.com';
const password = 'Iclr731y6p35f06!';

const datastore: any = {
  accountId: '38364',
  clientId: '292617',
  region: 'ap',
  networks: [],
  syncModules: [],
  cameras: []
};

app.get('/login', async (req, res) => {
  const data = {
    email: email,
    password: password,
    unique_id: v4(),
    device_identifier: v4(),
    client_name: v4(),
    reauth: true
  };

  const [err, response] = await to(axios.post(`https://rest-prod.immedia-semi.com/api/v5/account/login`, data, {
    headers: {
      'content-type': 'application/json'
    }
  }));

  // console.log(err, response);
  datastore.accountId = response.data.account.account_id;
  datastore.clientId = response.data.account.client_id;
  datastore.token = response.data.auth.token;
  datastore.tier = response.data.account.tier;

  return res.status(200).send(response.data);
});

app.get('/verify', async (req, res) => {
  const pin = req.query.pin as string;
  const verifyEndpoint = `https://${datastore.tier}.immedia-semi.com/api/v4/account/${datastore.accountId}/client/${datastore.clientId}/pin/verify`;

  const [err, response] = await to(axios.post(verifyEndpoint, { pin: pin }, {
    headers: {
      'content-type': 'application/json',
      'token-auth': datastore.token
    }
  }))

  // console.log(err, response);

  return res.status(200).send(response.data);
});

app.get('/sysinfo', async (req, res) => {
  // ${datastore.tier}
  const endpoint = `https://${datastore.tier}.immedia-semi.com/api/v3/accounts/${datastore.accountId}/homescreen`;
  const [err, response] = await to(axios.get(endpoint, {
    headers: {
      'token-auth': datastore.token
    }
  }));

  datastore.networks = response.data.networks;
  datastore.cameras = response.data.cameras;
  datastore.syncModules = response.data.sync_modules;

  return res.status(200).send(response.data);
});

app.get('/arm', async (req, res) => {
  const [err, responses] = await to(Promise.all(datastore.networks.map(network => {
    return axios.post(`https://${datastore.tier}.immedia-semi.com/api/v1/accounts/${datastore.accountId}/networks/${network.id}/state/arm`, {}, {
      headers: {
        'token-auth': datastore.token
      }
    })
  })));

  return res.status(200).send(responses.map((response: any) => response.data));
});

app.get('/disarm', async (req, res) => {
  const [err, responses] = await to(Promise.all(datastore.networks.map(network => {
    return axios.post(`https://${datastore.tier}.immedia-semi.com/api/v1/accounts/${datastore.accountId}/networks/${network.id}/state/disarm`, {}, {
      headers: {
        'token-auth': datastore.token
      }
    })
  })));

  return res.status(200).send(responses.map((response: any) => response.data));
});

app.listen(8080, () => {
  console.log('listening on 8080');
});
