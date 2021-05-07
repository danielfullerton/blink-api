import { write } from './lib/data';
import * as express from 'express';
import { armCamera, armNetwork, disArmCamera, disArmNetwork, getSysInfo, login, verify } from './service/service';

require('dotenv').config();
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

app.get('/armCamera', async (req, res) => {
  try {
    const cameraName = req.query?.camera as string;
    const response = await armCamera(cameraName);
    return res.status(200).send({
      message: 'successfully armed camera',
      data: {
        response
      }
    });
  } catch (e) {
    return res.status(500).send({
      error: e,
      message: 'failed to arm camera'
    });
  }
});

app.get('/disArmCamera', async (req, res) => {
  try {
    const cameraName = req.query?.camera as string;
    const response = await disArmCamera(cameraName);
    return res.status(200).send({
      message: 'successfully disarmed camera',
      data: {
        response
      }
    });
  } catch (e) {
    return res.status(500).send({
      error: e,
      message: 'failed to disarm camera'
    });
  }
});

app.get('/', (req, res) => {
  return res.status(200).send('OKIE');
});

if (process.env.FRESH_START) {
  write({}, true);
}

app.listen(8080, () => {
  console.log('listening on port 8080');
});
