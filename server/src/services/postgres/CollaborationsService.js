const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async _getPlaylistByPlaylistId(playlistId) {
    const query = {
      text: `
        SELECT playlists.id, playlists.name, users.username, playlists.owner
        FROM playlists
        JOIN users ON playlists.owner = users.id
        WHERE playlists.id = $1 AND playlists.is_delete = FALSE
      `,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (result.rows.length <= 0) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    return result.rows[0];
  }

  async _getUserById(userId) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new NotFoundError('User yang akan ditambahkan tidak ada');
    }
  }

  async addUserAsCollaborator(userId, playlistId, addedUserId) {
    if (userId === addedUserId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    const dbPlaylist = await this._getPlaylistByPlaylistId(playlistId);
    if (dbPlaylist.owner !== userId) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    await this._getUserById(addedUserId);

    const id = `collab-${nanoid(16)}`;
    const query = {
      text: `
        INSERT INTO collaborations (id, playlist_id, user_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      values: [id, playlistId, addedUserId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new InvariantError('Gagal menambahkan collaborator');
    }

    return result.rows[0].id;
  }

  async deleteUserFromCollaborator(userId, playlistId, deletedUserId) {
    if (userId === deletedUserId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    const dbPlaylist = await this._getPlaylistByPlaylistId(playlistId);
    if (dbPlaylist.owner !== userId) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    await this._getUserById(deletedUserId);

    const query = {
      text: `
        DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2
      `,
      values: [playlistId, deletedUserId],
    };
    const result = await this._pool.query(query);
    if (result.rowCount === 0) {
      throw new InvariantError('Tidak ada collaborator yang dihapus');
    }
  }
}

module.exports = CollaborationsService;
