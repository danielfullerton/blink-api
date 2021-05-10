import { retryAuthWhenFails } from '../lib/auth';
import { armCamera, disArmCamera } from '../service/cameraService';
import { email } from '../lib/email';

export const armCameraHandler = async (req, res) => {
  try {
    const cameraName = req.query?.camera as string;
    const response = await retryAuthWhenFails(() => armCamera(cameraName));
    await email('Blink API successfully armed camera(s)', (cameraName || 'All cameras') + ' successfully armed');

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
};

export const disarmCameraHandler = async (req, res) => {
  try {
    const cameraName = req.query?.camera as string;
    const response = await retryAuthWhenFails(() => disArmCamera(cameraName));
    await email('Blink API successfully disarmed camera(s)', (cameraName || 'All cameras') + ' successfully disarmed');
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
};
