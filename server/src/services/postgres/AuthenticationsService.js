const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const TokenManager = require('../tokenize/TokenManager');
const AuthenticationError = require('../../exceptions/AuthenticationError');
// const { nanoid } = require('nanoid');
// const InvariantError = require('../../exceptions/InvariantError');
// const NotFoundError = require('../../exceptions/NotFoundError');

class AuthenticationsService {
  constructor() {
    this._pool = new Pool();
    this._tokenManager = TokenManager;
  }

  async verifyAccessToken(token) {
    try {
      const { id: userId } = this._tokenManager.validateAccessToken(token);

      const query = {
        text: 'SELECT * FROM users WHERE id = $1',
        values: [userId],
      };
      const result = await this._pool.query(query);

      if (result.rows.length === 0) {
        throw new AuthenticationError('Kredensial yang Anda berikan salah');
      }

      return userId;
    } catch (error) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }
  }

  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };

    await this._pool.query(query);
  }

  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  async deleteRefreshToken(token) {
    await this.verifyRefreshToken(token);

    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };

    await this._pool.query(query);
  }

  // eslint-disable-next-line class-methods-use-this
  async getHeaderAuthorizationToken(request) {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const token = authorizationHeader.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    return token;
  }
}

module.exports = AuthenticationsService;
