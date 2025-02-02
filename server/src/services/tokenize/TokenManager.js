// eslint-disable-next-line import/no-extraneous-dependencies
const Jwt = require('@hapi/jwt');
const InvariantError = require('../../exceptions/InvariantError');

const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),
  validateRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
  validateAccessToken: (accessToken) => {
    try {
      const artifacts = Jwt.token.decode(accessToken);
      Jwt.token.verifySignature(artifacts, process.env.ACCESS_TOKEN_KEY);
      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Access token tidak valid');
    }
  },
};

module.exports = TokenManager;
