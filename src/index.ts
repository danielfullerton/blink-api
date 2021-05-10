import { retryAuthWhenFails } from './lib/auth';

require('dotenv').config();
import { write } from './lib/data';
import * as express from 'express';
import {
  armNetwork,
  disArmNetwork
} from './service/networkService';
import { getSysInfo, login, verify } from './service/authService';
import { armCamera, disArmCamera } from './service/cameraService';
import { loginHandler, verifyHandler } from './handlers/authHandler';
import { armNetworkHandler, disarmNetworkHandler } from './handlers/networkHandler';
import { armCameraHandler, disarmCameraHandler } from './handlers/armCameraHandler';
import { init } from './lib/aws';

const app = express();

app.get('/login', loginHandler);

app.get('/verify', verifyHandler);

app.get('/arm', armNetworkHandler);

app.get('/disarm', disarmNetworkHandler);

app.get('/armCamera', armCameraHandler);

app.get('/disArmCamera', disarmCameraHandler);

app.get('/', (req, res) => {
  return res.status(200).send('OKIE');
});

if (process.env.FRESH_START) {
  write({}, true);
}

init();

app.listen(8080, () => {
  console.log('listening on port 8080');
});
