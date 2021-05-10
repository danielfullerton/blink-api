import { getSysInfo, login, verify } from '../service/authService';

export const loginHandler = async (req, res) => {
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
};

export const verifyHandler = async (req, res) => {
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
};
