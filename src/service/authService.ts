import { BASE_URL, DEFAULT_SUB_DOMAIN, EMAIL, HTTPS, LOGIN_ENDPOINT, PASSWORD } from '../lib/constants';
import { getClientName, getDeviceId, getUniqueId } from '../lib/auth';
import axios from 'axios';
import { LoginResponse } from '../types/loginResponse';
import { read, write } from '../lib/data';
import { VerifyResponse } from '../types/verifyResponse';
import { SysInfoResponse } from '../types/sysInfoResponse';
import { email } from '../lib/email';

const verifyEndpoint = (accountId: string, clientId: string) => `/api/v4/account/${accountId}/client/${clientId}/pin/verify`;
const homeScreenEndpoint = (accountId: string) => `/api/v3/accounts/${accountId}/homescreen`;

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

  await email('Blink API authenticated using login logic');

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
