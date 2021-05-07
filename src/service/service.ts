import { v4 } from 'uuid';
import axios from 'axios';
import { LoginResponse } from '../types/loginResponse';
import { read, write } from '../lib/data';
import { VerifyResponse } from '../types/verifyResponse';
import { SysInfoResponse } from '../types/sysInfoResponse';

const HTTPS = 'https://'
const BASE_URL = 'immedia-semi.com';
const DEFAULT_SUB_DOMAIN = 'rest-prod';

const LOGIN_ENDPOINT = '/api/v5/account/login';
const verifyEndpoint = (accountId: string, clientId: string) => `/api/v4/account/${accountId}/client/${clientId}/pin/verify`;
const homescreenEndpoint = (accountId: string) => `/api/v3/accounts/${accountId}/homescreen`;
const armNetworkEndpoint = (accountId: string, networkId: string) => `/api/v1/accounts/${accountId}/networks/${networkId}/state/arm`;
const disArmNetworkEndpoint = (accountId: string, networkId: string) => `/api/v1/accounts/${accountId}/networks/${networkId}/state/disarm`;

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const ALL_NETWORKS_CONSTANT = "ALL_NETWORKS_CONSTANT";

export const login = async () => {
  const data = {
    email: EMAIL,
    password: PASSWORD,
    unique_id: v4(),
    device_identifier: v4(),
    client_name: v4(),
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
    .get(`${HTTPS}${tier}.${BASE_URL}${homescreenEndpoint(accountId)}`, {
      headers: { 'token-auth': authToken }
    })
    .then(response => response.data as SysInfoResponse);

  write({
    cameras: response.cameras,
    networks: response.networks,
    syncModules: response.sync_modules
  });
};

const makeArmNetworkCall = (tier: string, accountId: string, networkId: string, authToken: string) => {
  return axios
    .post(`${HTTPS}${tier}.${BASE_URL}${armNetworkEndpoint(accountId, `${networkId}`)}`, {}, {
      headers: { 'token-auth': authToken }
    })
    .then(response => [response.data]);
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
  return axios
    .post(`${HTTPS}${tier}.${BASE_URL}${disArmNetworkEndpoint(accountId, `${networkId}`)}`, {}, {
      headers: { 'token-auth': authToken }
    })
    .then(response => [response.data]);
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
