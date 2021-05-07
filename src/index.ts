import { write } from './lib/data';

require('dotenv').config();
import axios from 'axios';
import to from 'await-to-js';
import * as express from 'express';
import { armNetwork, disArmNetwork, getSysInfo, login, verify } from './service/service';
const app = express();

app.get('/login', async (req, res) => {
  try {
    const response = await login();
    return res.status(200).send({
      message: 'successfully logged in; check for verification code on phone',
      data: response
    });
  } catch (e) {
    return res.status(500).send({
      error: e,
      message: 'failed to log in'
    })
  }
});

app.get('/verify', async (req, res) => {
  try {
    const pin = req.query.pin as string;
    const verifyResponse = await verify(pin);
    const sysInfo = await getSysInfo();
    return res.status(200).send({
      message: 'successfully verified pin and retrieved network data',
      data: {
        verifyResponse,
        sysInfo
      }
    })
  } catch (e) {
    return res.status(500).send({
      error: e,
      message: 'failed to verify pin or get network data'
    });
  }
});

app.get('/arm', async (req, res) => {
  try {
    const networkName = req.query?.network as string;
    const response = await armNetwork(networkName);
    return res.status(200).send({
      message: 'successfully armed network',
      data: {
        response
      }
    });
  } catch (e) {
    return res.status(500).send({
      error: e,
      message: 'failed to arm network'
    });
  }
});

app.get('/disarm', async (req, res) => {
  try {
    const networkName = req.query?.network as string;
    const response = await disArmNetwork(networkName);
    return res.status(200).send({
      message: 'successfully disarmed network',
      data: {
        response
      }
    });
  } catch (e) {
    return res.status(500).send({
      error: e,
      message: 'failed to disarm network'
    });
  }
});

if (process.env.FRESH_START) {
  write({}, true);
}

app.listen(8080, () => {
  console.log('listening on 8080');
});
