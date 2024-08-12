const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async _addPlaylistActivity({
    playlistId, songId, userId, activity,
  }) {
    const psaId = `playlist-song-${nanoid(16)}`;
    const query = {
      text: `
          INSERT INTO playlist_song_activities (id, playlist_id, song_id, user_id, action, time)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          RETURNING id
        `,
      values: [psaId, playlistId, songId, userId, activity],
    };
    const result = await this._pool.query(query);
    if (result.rows.length <= 0) {
      throw new InvariantError('Gagal menambahkan activities.');
    }
  }

  async addPlaylist(userId, name) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: `
        INSERT INTO playlists (id, name, owner)
        VALUES($1, $2, $3)
        RETURNING id
      `,
      values: [id, name, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('User gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylist(userId) {
    const query = {
      text: `
        SELECT p.*, u.username
        FROM playlists as p
        LEFT JOIN collaborations as c ON c.playlist_id=p.id
        JOIN users as u ON p.owner=u.id
        WHERE p.owner = $1 OR c.user_id = $1 
      `,
      values: [userId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
    }));
  }

  async deletePlaylist(userId, playlistId) {
    const dbPlaylist = await this._getPlaylistByPlaylistId(playlistId);

    if (dbPlaylist.owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
    const query = {
      text: 'UPDATE playlists SET is_delete = true WHERE id = $1 AND owner = $2 RETURNING id',
      values: [playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal menghapus playlist.');
    }
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

  async _checkIsUserPlaylistCollaborator(playlistId, userId) {
    const query = {
      text: `
        SELECT * FROM collaborations
        WHERE playlist_id = $1 AND user_id = $2
      `,
      values: [playlistId, userId],
    };

    const result = await this._pool
      .query(query);

    if (result.rows.length <= 0) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async _getSongBySongId(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };
    const result = await this._pool.query(query);
    if (result.rows.length <= 0) {
      throw new NotFoundError('Song tidak ditemukan');
    }
    return result.rows[0];
  }

  async addSongToPlaylist(userId, playlistId, songId) {
    const dbPlaylist = await this._getPlaylistByPlaylistId(playlistId);

    if (dbPlaylist.owner !== userId) {
      await this._checkIsUserPlaylistCollaborator(playlistId, userId);
    }

    await this._getSongBySongId(songId);

    const psId = `playlist-song-${nanoid(16)}`;
    const queryAddSongToPlaylist = {
      text: `
        INSERT INTO 
        playlist_songs (id, playlist_id, song_id)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
      values: [psId, playlistId, songId],
    };
    const resultAddSongToPlaylist = await this._pool.query(queryAddSongToPlaylist);
    if (resultAddSongToPlaylist.rows.length <= 0) {
      throw new InvariantError('Gagal menambahkan song ke playlist.');
    }

    await this._addPlaylistActivity({
      playlistId,
      songId,
      userId,
      activity: 'add',
    });
  }

  async _getSongsByPlaylistId(playlistId) {
    const query = {
      text: `
        SELECT songs.id, songs.title, songs.performer
        FROM songs
        JOIN playlist_songs ON songs.id = playlist_songs.song_id
        WHERE playlist_songs.playlist_id = $1
      `,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongsFromPlaylist(userId, playlistId) {
    const dbPlaylist = await this._getPlaylistByPlaylistId(playlistId);

    if (dbPlaylist.owner !== userId) {
      await this._checkIsUserPlaylistCollaborator(playlistId, userId);
    }

    const songs = await this._getSongsByPlaylistId(playlistId);

    const result = {
      playlist: {
        id: dbPlaylist.id,
        name: dbPlaylist.name,
        username: dbPlaylist.username,
        songs,
      },
    };
    return result;
  }

  async deleteSongFromPlaylist(userId, playlistId, songId) {
    const dbPlaylist = await this._getPlaylistByPlaylistId(playlistId);

    if (dbPlaylist.owner !== userId) {
      await this._checkIsUserPlaylistCollaborator(playlistId, userId);
    }

    await this._getSongBySongId(songId);
    const query = {
      text: `
      DELETE FROM playlist_songs
      WHERE playlist_id = $1 AND song_id = $2
    `,
      values: [dbPlaylist.id, songId],
    };
    await this._pool.query(query);

    await this._addPlaylistActivity({
      playlistId,
      songId,
      userId,
      activity: 'delete',
    });
  }

  async getPlaylistActivities(userId, playlistId) {
    const dbPlaylist = await this._getPlaylistByPlaylistId(playlistId);

    if (dbPlaylist.owner !== userId) {
      await this._checkIsUserPlaylistCollaborator(playlistId, userId);
    }

    const query = {
      text: `
        SELECT psa.id, psa.action, psa.time, u.username, s.title
        FROM playlist_song_activities as psa
        JOIN songs AS s ON s.id=psa.song_id
        JOIN users AS u ON u.id=psa.user_id
        WHERE psa.playlist_id = $1
      `,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    return {
      playlistId,
      activities: result.rows.map((act) => ({
        username: act.username,
        title: act.title,
        action: act.action,
        time: act.time,
      })),
    };
  }

  async checkPlaylistOwner(userId, playlistId) {
    const dbPlaylist = await this._getPlaylistByPlaylistId(playlistId);

    if (dbPlaylist.owner !== userId) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    return playlistId;
  }
}

module.exports = PlaylistsService;
