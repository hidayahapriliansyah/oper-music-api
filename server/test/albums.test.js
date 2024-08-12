// eslint-disable-next-line import/no-extraneous-dependencies
const supertest = require('supertest');
const createServer = require('../src/createServer');
const {
  createAlbum, closePool, getAlbum,
  deleteAllAlbums,
  createAlbumWithSongs,
  createUserJohn,
  createAccessTokenByUserId,
  deleteAllUsers,
  deleteAllUserAlbumLikes,
  userAddLikeToAlbum,
  deleteAllSongs,
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

describe('POST /albums', () => {
  afterEach(async () => {
    await deleteAllAlbums();
  });

  it('should response error if payload is invalid', async () => {
    const response = await supertest(server.listener)
      .post('/albums')
      .send({ name: 21212, year: 'sdfsdf' });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should give status 201', async () => {
    const response = await supertest(server.listener)
      .post('/albums')
      .send({ name: 'New Album', year: 2022 });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.data.albumId).toBeDefined();
  });
});

describe('GET /albums/:albumId', () => {
  let albumId;

  beforeEach(async () => {
    albumId = await createAlbumWithSongs();
  });

  afterEach(async () => {
    await deleteAllAlbums();
  });

  it('should reponse error not found', async () => {
    const response = await supertest(server.listener)
      .get('/albums/id-ngaco');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should give status 200 with album and have no header x-data-source', async () => {
    // trigger cache
    await supertest(server.listener).get(`/albums/${albumId}`);

    // trigger delete cache
    await supertest(server.listener)
      .put(`/albums/${albumId}`)
      .send({ name: 'Updated Album', year: 2023 });

    const response = await supertest(server.listener).get(`/albums/${albumId}`);

    console.log('response.body =>', response.body);

    console.log('response.header =>', response.header);

    expect(response.header['x-data-source']).toBeUndefined();

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.album).toBeDefined();
    expect(response.body.data.album.id).toBe(albumId);
    expect(response.body.data.album.name).toBeDefined();
    expect(
      typeof response.body.data.album.coverUrl === 'string' || response.body.data.album.coverUrl === null,
    ).toBe(true);
    expect(response.body.data.album.year).toBeDefined();
    expect(response.body.data.album.songs.length).toBe(4);
    expect(response.body.data.album.songs[0].id).toBeDefined();
    expect(response.body.data.album.songs[0].title).toBeDefined();
    expect(response.body.data.album.songs[0].performer).toBeDefined();
  });

  it('should give status 200 with album with header x-data-source', async () => {
    // trigger cache
    await supertest(server.listener).get(`/albums/${albumId}`);

    const response = await supertest(server.listener).get(`/albums/${albumId}`);

    console.log('response.body =>', response.body);

    console.log('response.header =>', response.header);

    expect(response.header['x-data-source']).toBe('cache');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.album).toBeDefined();
    expect(response.body.data.album.id).toBe(albumId);
    expect(response.body.data.album.name).toBeDefined();
    expect(
      typeof response.body.data.album.coverUrl === 'string' || response.body.data.album.coverUrl === null,
    ).toBe(true);
    expect(response.body.data.album.year).toBeDefined();
    expect(response.body.data.album.songs.length).toBe(4);
    expect(response.body.data.album.songs[0].id).toBeDefined();
    expect(response.body.data.album.songs[0].title).toBeDefined();
    expect(response.body.data.album.songs[0].performer).toBeDefined();
  });
});

describe('PUT /albums/:albumId', () => {
  let albumId;

  beforeEach(async () => {
    albumId = await createAlbum({ name: 'Test Album', year: 2021 });
  });

  afterEach(async () => {
    await deleteAllAlbums();
  });

  it('should response error not found', async () => {
    const response = await supertest(server.listener)
      .put('/albums/id-ngaco')
      .send({ name: 'Updated Album', year: 2023 });

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should response error validation if payload not valid', async () => {
    const response = await supertest(server.listener)
      .put(`/albums/${albumId}`)
      .send({ name: 21212, year: 'sdfsdf' });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success with status 200', async () => {
    const response = await supertest(server.listener)
      .put(`/albums/${albumId}`)
      .send({ name: 'Updated Album', year: 2023 });

    const dbAlbum = await getAlbum();
    expect(dbAlbum.name).toBe('Updated Album');
    expect(dbAlbum.year).toBe(2023);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Album berhasil diperbarui');
  });
});

describe('DELETE /albums/:albumId', () => {
  let albumId;

  beforeEach(async () => {
    albumId = await createAlbum({ name: 'Test Album', year: 2021 });
  });

  afterEach(async () => {
    await deleteAllAlbums();
  });

  it('should response not found', async () => {
    const response = await supertest(server.listener)
      .delete('/albums/id-ngaco');

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success delete album', async () => {
    const response = await supertest(server.listener).delete(`/albums/${albumId}`);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBe('Album berhasil dihapus');
  });
});

describe('POST /albums/:albumsId/likes', () => {
  let johnUserId;
  let albumId;
  let accessTokenJohn;

  beforeEach(async () => {
    albumId = await createAlbumWithSongs();

    johnUserId = await createUserJohn();
    accessTokenJohn = createAccessTokenByUserId(johnUserId);
  });

  afterEach(async () => {
    await deleteAllUserAlbumLikes();
    await deleteAllSongs();
    await deleteAllAlbums();
    await deleteAllUsers();
  });

  it('should error if user have no token', async () => {
    const response = await supertest(server.listener)
      .post(`/albums/${albumId}/likes`);

    console.log('response.body =>', response.body);

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user have invalid token', async () => {
    const response = await supertest(server.listener)
      .post(`/albums/${albumId}/likes`)
      .set('Authorization', 'Bearer wrong-token');

    console.log('response.body =>', response.body);

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if albums is not found', async () => {
    const response = await supertest(server.listener)
      .post('/albums/wrong-albumid/likes')
      .set('Authorization', `Bearer ${accessTokenJohn}`);

    console.log('response.body =>', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user already like album', async () => {
    await userAddLikeToAlbum(johnUserId, albumId);

    const response = await supertest(server.listener)
      .post(`/albums/${albumId}/likes`)
      .set('Authorization', `Bearer ${accessTokenJohn}`);

    console.log('response.body =>', response.body);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success with status 201', async () => {
    const response = await supertest(server.listener)
      .post(`/albums/${albumId}/likes`)
      .set('Authorization', `Bearer ${accessTokenJohn}`);

    console.log('response.body =>', response.body);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBeDefined();
  });
});

describe('GET /albums/:albumId/likes', () => {
  let albumId;
  let johnUserId;
  let accessTokenJohn;

  beforeEach(async () => {
    albumId = await createAlbumWithSongs();
    johnUserId = await createUserJohn();
    accessTokenJohn = createAccessTokenByUserId(johnUserId);
  });

  afterEach(async () => {
    await deleteAllUserAlbumLikes();
    await deleteAllSongs();
    await deleteAllAlbums();
    await deleteAllUsers();
  });

  it('should error if albums is not found', async () => {
    const response = await supertest(server.listener)
      .get('/albums/wrong-albumid/likes');

    console.log('response.body =>', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success and having no header x-data-source', async () => {
    // trigger cache
    await supertest(server.listener)
      .get(`/albums/${albumId}/likes`);

    // trigger delete cache
    await supertest(server.listener)
      .post(`/albums/${albumId}/likes`)
      .set('Authorization', `Bearer ${accessTokenJohn}`);

    const response = await supertest(server.listener)
      .get(`/albums/${albumId}/likes`);

    console.log('response.body =>', response.body);
    console.log('response.header =>', response.header);

    expect(response.header['x-data-source']).toBeUndefined();
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.likes).toBe(1);
  });

  it('should success and return like 1 have header x-data-source', async () => {
    await userAddLikeToAlbum(johnUserId, albumId);

    // request pertama untuk trigger cache
    await supertest(server.listener)
      .get(`/albums/${albumId}/likes`);

    const response = await supertest(server.listener)
      .get(`/albums/${albumId}/likes`);

    console.log('response.body =>', response.body);
    console.log('response.header =>', response.header);

    expect(response.header['x-data-source']).toBe('cache');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.likes).toBe(1);
  });
});

describe('DELETE /albums/:albumsId/likes', () => {
  let johnUserId;
  let albumId;
  let accessTokenJohn;

  beforeEach(async () => {
    albumId = await createAlbumWithSongs();

    johnUserId = await createUserJohn();
    accessTokenJohn = createAccessTokenByUserId(johnUserId);
  });

  afterEach(async () => {
    await deleteAllUserAlbumLikes();
    await deleteAllSongs();
    await deleteAllAlbums();
    await deleteAllUsers();
  });

  it('should error if user have no token', async () => {
    const response = await supertest(server.listener)
      .delete(`/albums/${albumId}/likes`);

    console.log('response.body =>', response.body);

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user have invalid token', async () => {
    const response = await supertest(server.listener)
      .delete(`/albums/${albumId}/likes`)
      .set('Authorization', 'Bearer wrong-token');

    console.log('response.body =>', response.body);

    expect(response.status).toBe(401);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if albums is not found', async () => {
    const response = await supertest(server.listener)
      .delete('/albums/wrong-id/likes')
      .set('Authorization', `Bearer ${accessTokenJohn}`);

    console.log('response.body =>', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if user has not been liked album', async () => {
    const response = await supertest(server.listener)
      .delete(`/albums/${albumId}/likes`)
      .set('Authorization', `Bearer ${accessTokenJohn}`);

    console.log('response.body =>', response.body);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success with status 201', async () => {
    await userAddLikeToAlbum(johnUserId, albumId);

    const response = await supertest(server.listener)
      .delete(`/albums/${albumId}/likes`)
      .set('Authorization', `Bearer ${accessTokenJohn}`);

    console.log('response.body =>', response.body);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBeDefined();
  });
});
