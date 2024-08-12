const { Pool } = require('pg');
const { nanoid } = require('nanoid');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcrypt');
const TokenManager = require('../src/services/tokenize/TokenManager');
const AuthenticationsService = require('../src/services/postgres/AuthenticationsService');

const pool = new Pool();

const closePool = async () => {
  await pool.end();
};

const createAlbum = async ({ name, year }) => {
  const id = `album-${nanoid(16)}`;
  const query = {
    text: 'INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id',
    values: [id, name, year],
  };
  const result = await pool.query(query);
  return result.rows[0].id;
};

const deleteAlbumById = async (id) => {
  const query = {
    text: 'DELETE FROM albums WHERE id = $1',
    values: [id],
  };
  await pool.query(query);
};

const deleteAllAlbums = async () => {
  const query = {
    text: 'DELETE FROM albums',
  };
  await pool.query(query);
};

const getAlbum = async () => {
  const query = {
    text: 'SELECT * FROM albums',
  };
  const result = await pool.query(query);
  return result.rows[0];
};

const createSong = async (albumId) => {
  const id = nanoid(16);
  const title = 'Song title';
  const year = 2021;
  const genre = 'Jazz';
  const performer = 'Performer Name';
  const duration = 1000;

  const query = {
    text: 'INSERT INTO songs (id, title, year, genre, performer, duration, album_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    values: [id, title, year, genre, performer, duration, albumId],
  };

  const result = await pool.query(query);
  return result.rows[0].id;
};

const createAlbumWithSongs = async () => {
  const albumId = await createAlbum({ name: 'Album Name', year: 2024 });

  await createSong(albumId);
  await createSong(albumId);
  await createSong(albumId);
  await createSong(albumId);

  return albumId;
};

const createSongWithPerformerJKT48 = async () => {
  const albumId = await createAlbum({ name: 'Pajama Drive', year: 2011 });

  const id = nanoid(16);
  const title = 'Heavy Rotation';
  const year = 2011;
  const genre = 'Pop';
  const performer = 'JKT48';
  const duration = 320;

  const query = {
    text: 'INSERT INTO songs (id, title, year, genre, performer, duration, album_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
    values: [id, title, year, genre, performer, duration, albumId],
  };

  const result = await pool.query(query);
  return result.rows[0].id;
};

const getSong = async () => {
  const query = {
    text: 'SELECT * FROM songs',
  };
  const result = await pool.query(query);
  return result.rows[0];
};

const deleteAllSongs = async () => {
  const query = {
    text: 'DELETE FROM songs',
  };
  await pool.query(query);
};

const createUser = async () => {
  const id = `user-${nanoid(16)}`;
  const username = 'test_username';
  const fullname = 'Test Full Name';
  const password = await bcrypt.hash('rahasia', 10);

  const query = {
    text: `
    INSERT INTO
      users (id, username, fullname, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id
    `,
    values: [id, username, fullname, password],
  };

  const result = await pool.query(query);
  return result.rows[0].id;
};

const getUserByUsername = async (username) => {
  const query = {
    text: `
      SELECT * from users
      WHERE username = $1
    `,
    values: [username],
  };

  const result = await pool.query(query);
  return result.rows[0];
};

const deleteAllUsers = async () => {
  const query = {
    text: 'DELETE FROM users',
  };
  await pool.query(query);
};

const getUser = async () => {
  const query = {
    text: 'SELECT * from users',
  };

  const result = await pool.query(query);
  return result.rows[0];
};

const createUserThenGetRefreshToken = async () => {
  const userId = await createUser();
  const refreshToken = TokenManager.generateRefreshToken({ id: userId });
  const authService = new AuthenticationsService();
  await authService.addRefreshToken(refreshToken);
  return refreshToken;
};

const createUserThenGetAccessToken = async () => {
  const userId = await createUser();
  const accessToken = TokenManager.generateAccessToken({ id: userId });
  return accessToken;
};

const createAccessTokenByUserId = (userId) => {
  const accessToken = TokenManager.generateAccessToken({ id: userId });
  return accessToken;
};

const deleteAllRefreshToken = async () => {
  const query = {
    text: 'DELETE FROM authentications',
  };

  await pool.query(query);
};

const getAuthFromDb = async () => {
  const query = {
    text: 'DELETE FROM authentications RETURNING token',
  };

  const result = await pool.query(query);
  return result.rows[0];
};

const deleteAllPlaylists = async () => {
  const query = {
    text: 'DELETE FROM playlists',
  };
  await pool.query(query);
};

const createPlaylist = async () => {
  const { id: userId } = await getUser();
  const id = `playlist-${nanoid(16)}`;
  const name = 'listname';

  const query = {
    text: `
      INSERT INTO playlists (id, name, owner)
      VALUES($1, $2, $3)
      RETURNING id
    `,
    values: [id, name, userId],
  };

  const result = await pool.query(query);
  return result.rows[0].id;
};

const createUserJohn = async () => {
  const id = `user-${nanoid(16)}`;
  const username = 'test_john';
  const password = await bcrypt.hash('rahasia', 10);
  const fullname = 'Test John';
  const query = {
    text: `
      INSERT INTO users (id, username, password, fullname)
      VALUES($1, $2, $3, $4)
      RETURNING id
    `,
    values: [id, username, password, fullname],
  };
  const result = await pool.query(query);
  return result.rows[0].id;
};

const getUserJohn = async () => {
  const username = 'test_john';
  const query = {
    text: `
      SELECT * FROM users WHERE username = $1
    `,
    values: [username],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

const createUserDoe = async () => {
  const id = `user-${nanoid(16)}`;
  const username = 'test_doe';
  const password = await bcrypt.hash('rahasia', 10);
  const fullname = 'Test Doe';
  const query = {
    text: `
      INSERT INTO users (id, username, password, fullname)
      VALUES($1, $2, $3, $4)
      RETURNING id
    `,
    values: [id, username, password, fullname],
  };
  const result = await pool.query(query);
  return result.rows[0].id;
};

const getUserDoe = async () => {
  const username = 'test_doe';
  const query = {
    text: `
      SELECT * FROM users WHERE username = $1
    `,
    values: [username],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

const createPlaylistJohn = async () => {
  const { id: userId } = await getUserJohn();
  const id = `playlist-${nanoid(16)}`;
  const name = 'John Playlist';

  const query = {
    text: `
      INSERT INTO playlists (id, name, owner)
      VALUES($1, $2, $3)
      RETURNING id
    `,
    values: [id, name, userId],
  };

  const result = await pool.query(query);
  return result.rows[0].id;
};

const getJohnPlaylist = async () => {
  const name = 'John Playlist';

  const query = {
    text: 'SELECT * FROM playlists WHERE name = $1',
    values: [name],
  };

  const result = await pool.query(query);
  return result.rows[0];
};

const addDoeCollaborateToPlaylistJohn = async () => {
  const id = `collab-${nanoid(16)}`;
  const { id: playlistId } = await getJohnPlaylist();
  const { id: userId } = await getUserDoe();
  const query = {
    text: `
      INSERT INTO collaborations (id, playlist_id, user_id)
      VALUES ($1, $2, $3)
      RETURNING id
    `,
    values: [id, playlistId, userId],
  };

  const result = await pool.query(query);
  return result.rows[0].id;
};

const deleteAllPlaylistActivities = async () => {
  const query = {
    text: 'DELETE FROM playlist_song_activities',
  };
  await pool.query(query);
};

const addSongToPlaylist = async (playlistId, songId) => {
  const id = `playlist-song${nanoid(16)}`;
  const query = {
    text: `INSERT INTO playlist_songs (id, playlist_id, song_id) 
      VALUES ($1, $2, $3)
    `,
    values: [id, playlistId, songId],
  };
  await pool.query(query);
};

const deleteAllSongPlaylist = async () => {
  const query = {
    text: 'DELETE FROM playlist_songs',
  };
  await pool.query(query);
};

const getOneCollaborations = async () => {
  const query = {
    text: 'SELECT * FROM collaborations',
  };
  const result = await pool.query(query);
  return result.rows[0];
};

const deleteAllCollaborations = async () => {
  const query = {
    text: 'DELETE FROM collaborations',
  };
  await pool.query(query);
};

const addCollaborator = async (userId, playlistId) => {
  const id = 'random-id';
  const query = {
    text: 'INSERT INTO collaborations (id, playlist_id, user_id) VALUES($1, $2, $3)',
    values: [id, playlistId, userId],
  };
  await pool.query(query);
};

const addPlaylistActivity = async ({
  playlistId, songId, userId, activity,
}) => {
  const psaId = `playlist-song-${nanoid(16)}`;
  const query = {
    text: `
          INSERT INTO playlist_song_activities (id, playlist_id, song_id, user_id, action, time)
          VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          RETURNING id
        `,
    values: [psaId, playlistId, songId, userId, activity],
  };
  await pool.query(query);
};

const deleteAllUserAlbumLikes = async () => {
  const query = {
    text: 'DELETE FROM user_album_likes',
  };
  await pool.query(query);
};

const _increaseAlbumLikeCount = async (albumId) => {
  const query = {
    text: `
      UPDATE albums
      SET "total_likes" = "total_likes" + 1 
      WHERE id = $1
    `,
    values: [albumId],
  };
  await pool.query(query);
};

const userAddLikeToAlbum = async (userId, albumId) => {
  const id = `user-album-like${nanoid(16)}`;
  const query = {
    text: `
        INSERT INTO user_album_likes (id, user_id, album_id)
        VALUES ($1, $2, $3)
      `,
    values: [id, userId, albumId],
  };
  await pool.query(query);

  _increaseAlbumLikeCount(albumId);
};

const getAlbumById = async (albumId) => {
  const query = {
    text: 'SELECT * FROM albums WHERE id = $1',
    values: [albumId],
  };
  const result = await pool.query(query);
  return result.rows[0];
};

module.exports = {
  closePool,
  createAlbum,
  deleteAlbumById,
  deleteAllAlbums,
  getAlbum,
  createSong,
  createAlbumWithSongs,
  createSongWithPerformerJKT48,
  getSong,
  deleteAllSongs,
  createUser,
  getUserByUsername,
  deleteAllUsers,
  getUser,
  createUserThenGetRefreshToken,
  createUserThenGetAccessToken,
  createAccessTokenByUserId,
  deleteAllRefreshToken,
  getAuthFromDb,
  deleteAllPlaylists,
  createPlaylist,
  createUserJohn,
  getUserJohn,
  createUserDoe,
  getUserDoe,
  createPlaylistJohn,
  getJohnPlaylist,
  addDoeCollaborateToPlaylistJohn,
  deleteAllPlaylistActivities,
  addSongToPlaylist,
  deleteAllSongPlaylist,
  deleteAllCollaborations,
  getOneCollaborations,
  addCollaborator,
  addPlaylistActivity,
  deleteAllUserAlbumLikes,
  userAddLikeToAlbum,
  getAlbumById,
};
