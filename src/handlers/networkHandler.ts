import { retryAuthWhenFails } from '../lib/auth';
import { armNetwork, disArmNetwork } from '../service/networkService';
import { email } from '../lib/email';

export const armNetworkHandler = async (req, res) => {
  try {
    const networkName = req.query?.network as string;
    const response = await retryAuthWhenFails(() => armNetwork(networkName));
    await email('Blink API successfully armed network(s)', (networkName || 'All networks') + ' successfully armed');
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
};

export const disarmNetworkHandler = async (req, res) => {
  try {
    const networkName = req.query?.network as string;
    const response = await retryAuthWhenFails(() => disArmNetwork(networkName));
    await email('Blink API successfully disarmed network(s)', (networkName || 'All networks') + ' successfully disarmed');
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
};
