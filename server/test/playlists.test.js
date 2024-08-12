// eslint-disable-next-line import/no-extraneous-dependencies
const supertest = require('supertest');
const createServer = require('../src/createServer');
const {
  closePool,
  createUserThenGetAccessToken,
  deleteAllUsers,
  deleteAllPlaylists,
  createUserJohn,
  createAccessTokenByUserId,
  createPlaylist,
  createPlaylistJohn,
  addDoeCollaborateToPlaylistJohn,
  createUserDoe,
  createSong,
  deleteAllSongs,
  deleteAllPlaylistActivities,
  addSongToPlaylist,
  deleteAllSongPlaylist,
  addPlaylistActivity,
  createSongWithPerformerJKT48,
} = require('./utils');

let server;

beforeAll(async () => {
  server = await createServer();
  await server.start();
});

afterAll(async () => {
  await server.stop();
  await closePool();
});

describe('POST /playlists', () => {
  let accessToken;

  beforeEach(async () => {
    accessToken = await createUserThenGetAccessToken();
  });

  afterEach(async () => {
    await deleteAllUsers();
    await deleteAllPlaylists();
  });

  it('should error if user have no token', async () => {
    const response = await supertest(server.listener)
      .post('/playlists');

    console.log('response.body =>', response.body);

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user have invalid token', async () => {
    const response = await supertest(server.listener)
      .post('/playlists')
      .set('Authorization', 'Bearer wrong-token')
      .send({});

    console.log('response.body =>', response.body);

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user send invalid payload schema', async () => {
    const response = await supertest(server.listener)
      .post('/playlists')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success create playlist', async () => {
    const response = await supertest(server.listener)
      .post('/playlists')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'My Favorite',
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.playlistId).toBeDefined();
  });
});

describe('GET /playlists', () => {
  let accessToken;
  let doeAccessToken;

  beforeEach(async () => {
    const johnUserId = await createUserJohn();
    accessToken = createAccessTokenByUserId(johnUserId);

    await createPlaylistJohn();

    const doeUserId = await createUserDoe();
    doeAccessToken = createAccessTokenByUserId(doeUserId);

    await addDoeCollaborateToPlaylistJohn();
  });

  afterEach(async () => {
    await deleteAllUsers();
    await deleteAllPlaylists();
  });

  it('should error if user have no token', async () => {
    const response = await supertest(server.listener)
      .get('/playlists');

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user have invalid token', async () => {
    const response = await supertest(server.listener)
      .get('/playlists')
      .set('Authorization', 'Bearer wrong-token');

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success and give 1 playlist from John', async () => {
    const response = await supertest(server.listener)
      .get('/playlists')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.playlists.length).toBe(1);
    expect(Object.keys(response.body.data.playlists[0]).length).toBe(3);
    expect(response.body.data.playlists[0].id).toBeDefined();
    expect(response.body.data.playlists[0].name).toBeDefined();
    expect(response.body.data.playlists[0].username).toBeDefined();
  });

  it('should success and give 1 playlist from Doe', async () => {
    const response = await supertest(server.listener)
      .get('/playlists')
      .set('Authorization', `Bearer ${doeAccessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.playlists.length).toBe(1);
    expect(Object.keys(response.body.data.playlists[0]).length).toBe(3);
    expect(response.body.data.playlists[0].id).toBeDefined();
    expect(response.body.data.playlists[0].name).toBeDefined();
    expect(response.body.data.playlists[0].username).toBeDefined();
  });
});

describe('DELETE /playlists', () => {
  let accessToken;
  let playlistId;

  beforeEach(async () => {
    accessToken = await createUserThenGetAccessToken();
    playlistId = await createPlaylist();
  });

  afterEach(async () => {
    await deleteAllUsers();
    await deleteAllPlaylists();
  });

  it('should error if user have no token', async () => {
    const response = await supertest(server.listener)
      .delete(`/playlists/${playlistId}`);

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user have invalid token', async () => {
    const response = await supertest(server.listener)
      .delete(`/playlists/${playlistId}`)
      .set('Authorization', 'Bearer wrong-token');

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if playlist not found', async () => {
    const response = await supertest(server.listener)
      .delete('/playlists/random-playlistid')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success', async () => {
    const response = await supertest(server.listener)
      .delete(`/playlists/${playlistId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBeDefined();
  });
});

describe('POST /playlists/:playlistId/songs', () => {
  let accessTokenJohn;
  let accessTokenDoe;
  let playlistId;
  let songId;

  beforeEach(async () => {
    const johnUserId = await createUserJohn();

    const doeUserId = await createUserDoe();

    accessTokenJohn = createAccessTokenByUserId(johnUserId);
    accessTokenDoe = createAccessTokenByUserId(doeUserId);

    playlistId = await createPlaylistJohn();
    songId = await createSong();
  });

  afterEach(async () => {
    await deleteAllUsers();
    await deleteAllPlaylists();
    await deleteAllSongs();
    await deleteAllPlaylistActivities();
  });

  it('should error if user have no token', async () => {
    const response = await supertest(server.listener)
      .post(`/playlists/${playlistId}/songs`)
      .send({
        songId,
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user have invalid token', async () => {
    const response = await supertest(server.listener)
      .post(`/playlists/${playlistId}/songs`)
      .set('Authorization', 'Bearer wrong-token')
      .send({
        songId,
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if playlist id is not found', async () => {
    const response = await supertest(server.listener)
      .post('/playlists/wrong-playlistid/songs')
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        songId,
      });

    console.log('response.body', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('Playlist tidak ditemukan');
  });

  it('should error if payload body is invalid', async () => {
    const response = await supertest(server.listener)
      .post(`/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${accessTokenJohn}`);

    console.log('response.body', response.body);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if song id is not found', async () => {
    const response = await supertest(server.listener)
      .post(`/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        songId: 'wrong song id',
      });

    console.log('response.body', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('Song tidak ditemukan');
  });

  it('should error if user is not owner or collaborator', async () => {
    const response = await supertest(server.listener)
      .post(`/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${accessTokenDoe}`)
      .send({
        songId,
      });

    console.log('response.body =>', response.body);

    expect(response.status).toBe(403);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success if owner added song to playlist', async () => {
    const response = await supertest(server.listener)
      .post(`/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        songId,
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBeDefined();
  });

  it('should success if collaborator added song to playlist', async () => {
    await addDoeCollaborateToPlaylistJohn();

    const response = await supertest(server.listener)
      .post(`/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${accessTokenDoe}`)
      .send({
        songId,
      });

    console.log('response.body =>', response.body);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBeDefined();
  });
});

describe('GET /playlists/:playlistId/songs', () => {
  let accessTokenJohn;
  let accessTokenDoe;
  let playlistId;
  let songId;

  beforeEach(async () => {
    const johnUserId = await createUserJohn();

    const doeUserId = await createUserDoe();

    accessTokenJohn = createAccessTokenByUserId(johnUserId);
    accessTokenDoe = createAccessTokenByUserId(doeUserId);

    playlistId = await createPlaylistJohn();
    songId = await createSong();
    await addSongToPlaylist(playlistId, songId);
  });

  afterEach(async () => {
    await deleteAllSongPlaylist();
    await deleteAllPlaylists();
    await deleteAllPlaylistActivities();
    await deleteAllUsers();
    await deleteAllSongs();
  });

  it('should error if user have no token', async () => {
    const response = await supertest(server.listener)
      .get(`/playlists/${playlistId}/songs`);

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user have invalid token', async () => {
    const response = await supertest(server.listener)
      .get(`/playlists/${playlistId}/songs`)
      .set('Authorization', 'Bearer wrong-token');

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if playlist id is not found', async () => {
    const response = await supertest(server.listener)
      .get('/playlists/wrong-playlistid/songs')
      .set('Authorization', `Bearer ${accessTokenJohn}`);

    console.log('response.body', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('Playlist tidak ditemukan');
  });

  it('should success if user is owner', async () => {
    const response = await supertest(server.listener)
      .get(`/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${accessTokenJohn}`);

    console.log('response.body', response.body);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.playlist.id).toBeDefined();
    expect(response.body.data.playlist.name).toBeDefined();
    expect(response.body.data.playlist.username).toBeDefined();
    expect(response.body.data.playlist.songs.length).toBe(1);
    expect(response.body.data.playlist.songs[0].id).toBeDefined();
    expect(response.body.data.playlist.songs[0].title).toBeDefined();
    expect(response.body.data.playlist.songs[0].performer).toBeDefined();
  });

  it('should success if user is collaborator', async () => {
    await addDoeCollaborateToPlaylistJohn();

    const response = await supertest(server.listener)
      .get(`/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${accessTokenDoe}`);

    console.log('response.body', response.body);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.playlist.id).toBeDefined();
    expect(response.body.data.playlist.name).toBeDefined();
    expect(response.body.data.playlist.username).toBeDefined();
    expect(response.body.data.playlist.songs.length).toBe(1);
    expect(response.body.data.playlist.songs[0].id).toBeDefined();
    expect(response.body.data.playlist.songs[0].title).toBeDefined();
    expect(response.body.data.playlist.songs[0].performer).toBeDefined();
  });
});

describe('DELETE /playlists/:playlistId/songs', () => {
  let accessTokenJohn;
  let accessTokenDoe;
  let playlistId;
  let songId;

  beforeEach(async () => {
    const johnUserId = await createUserJohn();

    const doeUserId = await createUserDoe();

    accessTokenJohn = createAccessTokenByUserId(johnUserId);
    accessTokenDoe = createAccessTokenByUserId(doeUserId);

    playlistId = await createPlaylistJohn();
    songId = await createSong();

    await addSongToPlaylist(playlistId, songId);
  });

  afterEach(async () => {
    await deleteAllUsers();
    await deleteAllPlaylists();
    await deleteAllSongs();
    await deleteAllPlaylistActivities();
  });

  it('should error if user have no token', async () => {
    const response = await supertest(server.listener)
      .delete(`/playlists/${playlistId}/songs`)
      .send({
        songId,
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user have invalid token', async () => {
    const response = await supertest(server.listener)
      .delete(`/playlists/${playlistId}/songs`)
      .set('Authorization', 'Bearer wrong-token')
      .send({
        songId,
      });

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if playlist id is not found', async () => {
    const response = await supertest(server.listener)
      .delete('/playlists/wrong-playlistid/songs')
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        songId,
      });

    console.log('response.body', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('Playlist tidak ditemukan');
  });

  it('should error if payload body is invalid', async () => {
    const response = await supertest(server.listener)
      .delete(`/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${accessTokenJohn}`);

    console.log('response.body', response.body);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if song id is not found', async () => {
    const response = await supertest(server.listener)
      .delete(`/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        songId: 'wrong song id',
      });

    console.log('response.body', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBe('Song tidak ditemukan');
  });

  it('should error if user is not owner or collaborator', async () => {
    const response = await supertest(server.listener)
      .delete(`/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${accessTokenDoe}`)
      .send({
        songId,
      });

    console.log('response.body =>', response.body);

    expect(response.status).toBe(403);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success if owner delete song from playlist', async () => {
    const response = await supertest(server.listener)
      .delete(`/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${accessTokenJohn}`)
      .send({
        songId,
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBeDefined();
  });

  it('should success if collaborator delete song from playlist', async () => {
    await addDoeCollaborateToPlaylistJohn();

    const response = await supertest(server.listener)
      .delete(`/playlists/${playlistId}/songs`)
      .set('Authorization', `Bearer ${accessTokenDoe}`)
      .send({
        songId,
      });

    console.log('response.body =>', response.body);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBeDefined();
  });
});

describe('GET /playlists/:playlistId/activities', () => {
  let accessTokenJohn;
  let playlistId;
  let songId;

  beforeEach(async () => {
    const johnUserId = await createUserJohn();

    const doeUserId = await createUserDoe();

    accessTokenJohn = createAccessTokenByUserId(johnUserId);

    playlistId = await createPlaylistJohn();

    songId = await createSongWithPerformerJKT48();
    await addSongToPlaylist(playlistId, songId);
    await addPlaylistActivity({
      playlistId,
      songId,
      userId: johnUserId,
      activity: 'add',
    });
    await addPlaylistActivity({
      playlistId,
      songId,
      userId: doeUserId,
      activity: 'delete',
    });
  });

  afterEach(async () => {
    await deleteAllPlaylistActivities();
    await deleteAllPlaylists();
    await deleteAllUsers();
    await deleteAllSongs();
  });

  it('should error if user have no token', async () => {
    const response = await supertest(server.listener)
      .get(`/playlists/${playlistId}/activities`);

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user have invalid token', async () => {
    const response = await supertest(server.listener)
      .get(`/playlists/${playlistId}/activities`)
      .set('Authorization', 'Bearer wrong-token');

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if playlist not found', async () => {
    const response = await supertest(server.listener)
      .get('/playlists/random-playlist-id/activities')
      .set('Authorization', `Bearer ${accessTokenJohn}`);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success if playlist', async () => {
    const response = await supertest(server.listener)
      .get(`/playlists/${playlistId}/activities`)
      .set('Authorization', `Bearer ${accessTokenJohn}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.playlistId).toBeDefined();
    expect(response.body.data.activities).toBeDefined();
    expect(Object.keys(response.body.data.activities[0]).length).toBe(4);
    expect(response.body.data.activities[0].username).toBeDefined();
    expect(response.body.data.activities[0].title).toBeDefined();
    expect(response.body.data.activities[0].action).toBeDefined();
    expect(response.body.data.activities[0].time).toBeDefined();
  });
});
