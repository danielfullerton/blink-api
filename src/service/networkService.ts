import axios from 'axios';
import { read } from '../lib/data';
import * as retry from 'async-retry';
import { ALL_NETWORKS_CONSTANT, BASE_URL, HTTPS } from '../lib/constants';

const armNetworkEndpoint = (accountId: string, networkId: string) => `/api/v1/accounts/${accountId}/networks/${networkId}/state/arm`;
const disArmNetworkEndpoint = (accountId: string, networkId: string) => `/api/v1/accounts/${accountId}/networks/${networkId}/state/disarm`;

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

