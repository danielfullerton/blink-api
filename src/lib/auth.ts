import { v4 } from 'uuid';
import { login } from '../service/authService';

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

const uniqueId = v4();

export const getUniqueId = () => {
  if (process.env.RANDOM_IDS) {
    return v4();
  } else {
    return uniqueId;
  }
}

const deviceId = v4();
export const getDeviceId = () => {
  if (process.env.RANDOM_IDS) {
    return v4();
  } else {
    return deviceId;
  }
}

const clientName = v4();
export const getClientName = () => {
  if (process.env.RANDOM_IDS) {
    return v4();
  } else {
    return clientName;
  }
}
