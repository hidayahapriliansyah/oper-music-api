// eslint-disable-next-line import/no-extraneous-dependencies
const path = require('path');
const supertest = require('supertest');
const createServer = require('../src/createServer');
const {
  closePool,
  deleteAllAlbums,
  createAlbumWithSongs,
  getAlbumById,
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

describe('POST /albums/:albumId/covers', () => {
  let albumId;

  beforeEach(async () => {
    albumId = await createAlbumWithSongs();
  });

  afterEach(async () => {
    await deleteAllAlbums();
  });

  it('should error if album id invalid', async () => {
    const filePath = path.join(__dirname, 'files/valid-image.jpeg');

    const response = await supertest(server.listener)
      .post('/albums/wrong-albumid/covers')
      .set('Content-Type', 'multipart/form-data')
      .attach('cover', filePath);

    console.log('response.body =>', response.body);

    expect(response.status).toBe(404);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if file is not image', async () => {
    const filePath = path.join(__dirname, 'files/txt.txt');

    const response = await supertest(server.listener)
      .post(`/albums/${albumId}/covers`)
      .set('Content-Type', 'multipart/form-data')
      .attach('cover', filePath);

    console.log('response.body =>', response.body);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if Content type is not multipart', async () => {
    const response = await supertest(server.listener)
      .post(`/albums/${albumId}/covers`)
      .set('Content-Type', 'application/json')
      .send({});

    console.log('response.body =>', response.body);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should error if file larger than 500 KB', async () => {
    const filePath = path.join(__dirname, 'files/large-image.jpg');

    const response = await supertest(server.listener)
      .post(`/albums/${albumId}/covers`)
      .set('Content-Type', 'multipart/form-data')
      .attach('cover', filePath);

    console.log('response.body =>', response.body);

    expect(response.status).toBe(413);
    expect(response.body.message).toBeDefined();
  });

  it('should error if payload property is not cover', async () => {
    const filePath = path.join(__dirname, 'files/valid-image.jpeg');

    const response = await supertest(server.listener)
      .post(`/albums/${albumId}/covers`)
      .set('Content-Type', 'multipart/form-data')
      .attach('image', filePath);

    console.log('response.body =>', response.body);

    expect(response.status).toBe(400);
    expect(response.body.status).toBe('fail');
    expect(response.body.message).toBeDefined();
  });

  it('should success upload file and change cover', async () => {
    const filePath = path.join(__dirname, 'files/valid-image.jpeg');

    const response = await supertest(server.listener)
      .post(`/albums/${albumId}/covers`)
      .set('Content-Type', 'multipart/form-data')
      .attach('cover', filePath);

    const album = await getAlbumById(albumId);
    console.log('album =>', album);

    expect(album.cover).toBeDefined();
    expect(typeof album.cover).toBe('string');

    console.log('response.body =>', response.body);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('success');
    expect(response.body.message).toBeDefined();
  });
});
