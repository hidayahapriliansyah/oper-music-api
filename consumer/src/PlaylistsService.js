const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async _getPlaylistByPlaylistId(playlistId) {
    const query = {
      text: `
        SELECT id, name
        FROM playlists
        WHERE id = $1 AND is_delete = FALSE
      `,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (result.rows.length <= 0) {
      console.log('Playlist tidak ditemukan');
    }
    return result.rows[0];
  }

  async _getSongsByPlaylistId(playlistId) {
    const queryGetSOngs = {
      text: 'SELECT * FROM songs',
    };
    const resultGetSongs = await this._pool.query(queryGetSOngs);
    console.log('resultGetSongs.rows =>', resultGetSongs.rows);

    const query = {
      text: `
        SELECT songs.id, songs.title, songs.performer
        FROM songs
        JOIN playlist_songs ON songs.id=playlist_songs.song_id
        WHERE playlist_songs.playlist_id = $1
      `,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongsFromPlaylist(playlistId) {
    const dbPlaylist = await this._getPlaylistByPlaylistId(playlistId);

    const songs = await this._getSongsByPlaylistId(playlistId);

    const result = {
      playlist: {
        id: dbPlaylist.id,
        name: dbPlaylist.name,
        songs,
      },
    };
    return result;
  }
}

module.exports = PlaylistsService;
