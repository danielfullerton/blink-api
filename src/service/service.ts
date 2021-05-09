import { v4 } from 'uuid';
import axios from 'axios';
import { LoginResponse } from '../types/loginResponse';
import { read, write } from '../lib/data';
import { VerifyResponse } from '../types/verifyResponse';
import { SysInfoResponse } from '../types/sysInfoResponse';
import * as retry from 'async-retry';

const HTTPS = 'https://'
const BASE_URL = 'immedia-semi.com';
const DEFAULT_SUB_DOMAIN = 'rest-prod';

const LOGIN_ENDPOINT = '/api/v5/account/login';
const verifyEndpoint = (accountId: string, clientId: string) => `/api/v4/account/${accountId}/client/${clientId}/pin/verify`;
const homeScreenEndpoint = (accountId: string) => `/api/v3/accounts/${accountId}/homescreen`;
const armNetworkEndpoint = (accountId: string, networkId: string) => `/api/v1/accounts/${accountId}/networks/${networkId}/state/arm`;
const disArmNetworkEndpoint = (accountId: string, networkId: string) => `/api/v1/accounts/${accountId}/networks/${networkId}/state/disarm`;
const armCameraEndpoint = (networkId: string, cameraId: string) => `/network/${networkId}/camera/${cameraId}/enable`;
const disArmCameraEndpoint = (networkId: string, cameraId: string) => `/network/${networkId}/camera/${cameraId}/disable`;

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const ALL_NETWORKS_CONSTANT = "ALL_NETWORKS_CONSTANT";

const getUniqueId = () => {
  if (process.env.RANDOM_IDS) {
    return v4();
  } else {
    return 'blink-api-js';
  }
}

const getDeviceId = () => {
  if (process.env.RANDOM_IDS) {
    return v4();
  } else {
    return 'blink-api-js-device';
  }
}

const getClientName = () => {
  if (process.env.RANDOM_IDS) {
    return v4();
  } else {
    return 'blink-api-js-client';
  }
}

export const login = async () => {
  const data = {
    email: EMAIL,
    password: PASSWORD,
    unique_id: getUniqueId(),
    device_identifier: getDeviceId(),
    client_name: getClientName(),
    reauth: true
  };

  const response = await axios
    .post(`${HTTPS}${DEFAULT_SUB_DOMAIN}.${BASE_URL}${LOGIN_ENDPOINT}`, data)
    .then(response => response.data as LoginResponse);

  write({
    accountId: `${response.account.account_id}`,
    clientId: `${response.account.client_id}`,
    authToken: response.auth.token,
    tier: response.account.tier
  });

  return response;
};

export const verify = async (pin: string) => {
  const { tier, accountId, clientId, authToken } = read();
  return axios
    .post(`${HTTPS}${tier}.${BASE_URL}${verifyEndpoint(accountId, clientId)}`, {
      pin
    }, { headers: { 'token-auth': authToken } })
    .then(response => response.data as VerifyResponse);
};

export const getSysInfo = async () => {
  const { authToken, tier, accountId } = read();
  const response = await axios
    .get(`${HTTPS}${tier}.${BASE_URL}${homeScreenEndpoint(accountId)}`, {
      headers: { 'token-auth': authToken }
    })
    .then(response => response.data as SysInfoResponse);

  write({
    cameras: response.cameras,
    networks: response.networks,
    syncModules: response.sync_modules
  });
};

export const retryAuthWhenFails = async (fn: () => Promise<any>) => {
  try {
    return fn();
  } catch (e) {
    console.log('operation failed; retrying login to see if it fixes the issue');
    const loginResponse = await login();
    console.log('login refresh response: ', loginResponse);
    console.log('retrying failed operation now that login has been refreshed');
    return fn();
  }
}

const makeArmNetworkCall = (tier: string, accountId: string, networkId: string, authToken: string) => {
  return retry(bail => {
    return axios
      .post(`${HTTPS}${tier}.${BASE_URL}${armNetworkEndpoint(accountId, `${networkId}`)}`, {}, {
        headers: { 'token-auth': authToken }
      })
      .then(response => [response.data]);
  }, { retries: 3 });
}

export const armNetwork = async (name: string) => {
  const { networks, tier, accountId, authToken } = read();
  const network = name
    ? networks.filter(network => network.name === name)?.[0]
    : ALL_NETWORKS_CONSTANT;

  if (network === ALL_NETWORKS_CONSTANT) {
    return Promise.all(networks.map(network => {
      return makeArmNetworkCall(tier, accountId, `${network.id}`, authToken);
    }));
  } else if (network) {
    return makeArmNetworkCall(tier, accountId, `${network.id}`, authToken);
  } else {
    throw new Error('network not found');
  }
};

const makeDisArmNetworkCall = (tier: string, accountId: string, networkId: string, authToken: string) => {
  return retry(bail => {
    return axios
      .post(`${HTTPS}${tier}.${BASE_URL}${disArmNetworkEndpoint(accountId, `${networkId}`)}`, {}, {
        headers: { 'token-auth': authToken }
      })
      .then(response => [response.data]);
  }, { retries: 3 });
}

export const disArmNetwork = async (name: string) => {
  const { networks, tier, accountId, authToken } = read();
  const network = name
    ? networks.filter(network => network.name === name)?.[0]
    : ALL_NETWORKS_CONSTANT;

  if (network === ALL_NETWORKS_CONSTANT) {
    return Promise.all(networks.map(network => {
      return makeDisArmNetworkCall(tier, accountId, `${network.id}`, authToken);
    }));
  } else if (network) {
    return makeDisArmNetworkCall(tier, accountId, `${network.id}`, authToken);
  } else {
    throw new Error('network not found');
  }
};

const makeDisArmCameraCall = (tier: string, networkId: string, cameraId: string, authToken: string) => {
  return retry(bail => {
    return axios
      .post(`${HTTPS}${tier}.${BASE_URL}${disArmCameraEndpoint(networkId, `${cameraId}`)}`, {}, {
        headers: { 'token-auth': authToken }
      })
      .then(response => [response.data]);
  }, { retries: 3 });
}

export const disArmCamera = async (name: string) => {
  const { cameras, tier, accountId, authToken } = read();
  const camera = name
    ? cameras.filter(camera => camera.name === name)?.[0]
    : ALL_NETWORKS_CONSTANT;

  if (camera === ALL_NETWORKS_CONSTANT) {
    return Promise.all(cameras.map(camera => {
      return makeDisArmCameraCall(tier, `${camera.network_id}`, `${camera.id}`, authToken);
    }));
  } else if (camera) {
    return makeDisArmCameraCall(tier, `${camera.network_id}`, `${camera.id}`, authToken);
  } else {
    throw new Error('camera not found');
  }
};

const makeArmCameraCall = (tier: string, networkId: string, cameraId: string, authToken: string) => {
  return retry(bail => {
    return axios
      .post(`${HTTPS}${tier}.${BASE_URL}${armCameraEndpoint(networkId, `${cameraId}`)}`, {}, {
        headers: { 'token-auth': authToken }
      })
      .then(response => [response.data]);
  }, { retries: 3 })
}

export const armCamera = async (name: string) => {
  const { cameras, networks, tier, accountId, authToken } = read();
  const camera = name
    ? cameras.filter(camera => camera.name === name)?.[0]
    : ALL_NETWORKS_CONSTANT;

  if (camera === ALL_NETWORKS_CONSTANT) {
    cameras.map(camera => {
      return makeArmCameraCall(tier, `${camera.network_id}`, `${camera.id}`, authToken);
    });
  } else if (camera) {
    return makeArmCameraCall(tier, `${camera.network_id}`, `${camera.id}`, authToken);
  } else {
    throw new Error('camera not found');
  }
};
