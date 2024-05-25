import passport from 'passport';
import controller from './controller';
import response from '../../network/response';
import baseHandler from '@/server/network/baseHandler';
import * as jwt from 'jsonwebtoken';
import * as boom from '@hapi/boom';
import * as configEnv from '@/server/configEnv';
import { basicStrategy } from '@/utils/auth/strategies/basic';

const handler = baseHandler();
const apiURL = '/api/users';

passport.use(basicStrategy);

const authenticate = (method, req, res) =>
  new Promise((resolve, reject) => {
    passport.authenticate(method, { session: false }, (error, token) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    })(req, res);
  });

handler.post(`${apiURL}/sign-in`, async function (req, res, next) {
  try {
    const user = await authenticate('basic', req, res);
    if (!user) {
      next(boom.unauthorized());
      return;
    }

    req.login(user, { session: false }, async function (error) {
      if (error) {
        next(error);
      }

      delete user.password;
      const { _id: id, firstName, lastName, username } = user;

      const payload = {
        sub: id,
        name: `${firstName} ${lastName}`,
        username,
      };

      const sessionExpire = '1d';

      const token = jwt.sign(payload, configEnv.authJwtSecret, {
        expiresIn: sessionExpire,
      });

      const userResult = {
        ...user,
        token,
      };

      response.success(req, res, { user: userResult });
    });
  } catch (error) {
    next(boom.unauthorized());
  }
});

handler.post(`${apiURL}/sign-in-admin`, async function (req, res, next) {
  try {
    const user = await authenticate('basic', req, res);
    if (!user) {
      next(boom.unauthorized());
      return;
    }

    if (!user.roles.includes('admin')) {
      next(boom.unauthorized());
      return;
    }

    req.login(user, { session: false }, async function (error) {
      if (error) {
        next(error);
      }

      delete user.password;
      const { _id: id, firstName, lastName, username } = user;

      const payload = {
        sub: id,
        name: `${firstName} ${lastName}`,
        username,
      };

      const sessionExpire = '1d';

      const token = jwt.sign(payload, configEnv.authJwtSecret, {
        expiresIn: sessionExpire,
      });

      const userResult = {
        ...user,
        token,
      };

      response.success(req, res, { user: userResult });
    });
  } catch (error) {
    next(boom.unauthorized());
  }
});

// GET: api/users
handler.get(
  '/',
  // passport.authenticate('jwt', { session: false }),
  async function (req, res) {
    const result = await controller.findAll();
    response.success(req, res, result);
  }
);

// POST: api/users/sign-up
handler.post(`${apiURL}/sign-up`, async function (req, res) {
  try {
    const user = await controller.signUp(req.body);
    const { _id: id, firstName, lastName, username } = user;

    const payload = {
      sub: id,
      name: `${firstName} ${lastName}`,
      username,
    };

    const sessionExpire = '1d';

    const token = jwt.sign(payload, configEnv.authJwtSecret, {
      expiresIn: sessionExpire,
    });

    const userResult = {
      ...user,
      token,
    };
    response.success(req, res, userResult);
  } catch (error) {
    console.log('ERROR: ', error);
    response.error(req, res, 'Error al registrar el usuario', 400, error);
  }
});

//Authenticated
handler.use(passport.authenticate('jwt', { session: false }));

// POST: api/users
handler.post(`${apiURL}/`, async function (req, res) {
  try {
    const user = await controller.create(req.body);
    response.success(req, res, user);
  } catch (error) {
    console.log('ERROR: ', error);
    response.error(req, res, 'Error al registrar el usuario', 400, error);
  }
});

// POST: api/users/change-password
handler.post(`${apiURL}/change-password`, async function (req, res) {
  try {
    req.body.id = req.user.id;
    const result = await controller.changePassword(req.body);
    response.success(req, res, result);
  } catch (error) {
    console.log('ERROR: ', error);
    response.error(req, res, 'Error al registrar el usuario', 400, error);
  }
});

// POST: api/users/reset-password
handler.post(`${apiURL}/reset-password`, async function (req, res) {
  try {
    req.body.id = req.user.id;
    const result = await controller.resetPassword(req.body);
    response.success(req, res, result);
  } catch (error) {
    console.log('ERROR: ', error);
    response.error(req, res, 'Error al registrar el usuario', 400, error);
  }
});

handler
  .use(passport.authenticate('jwt', { session: false, failureRedirect: '/login' }))
  .post(`${apiURL}/statusChange`, async function (req, res) {
    try {
      const { user } = req;
      const model = await controller.statusChange(req.body, user);
      response.success(req, res, model);
    } catch (error) {
      console.log('ERROR: ', error);
      response.error(req, res, 'Error al cambiar estado al usuario', 400, error);
    }
  });

export default handler;
