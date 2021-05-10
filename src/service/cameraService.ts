import { read } from '../lib/data';
import { ALL_NETWORKS_CONSTANT, BASE_URL, HTTPS } from '../lib/constants';
import * as retry from 'async-retry';
import axios from 'axios';

const armCameraEndpoint = (networkId: string, cameraId: string) => `/network/${networkId}/camera/${cameraId}/enable`;
const disArmCameraEndpoint = (networkId: string, cameraId: string) => `/network/${networkId}/camera/${cameraId}/disable`;
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
