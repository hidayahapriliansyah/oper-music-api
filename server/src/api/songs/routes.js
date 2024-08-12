// eslint-disable-next-line no-unused-vars
const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: handler.addSong.bind(handler),

  },
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getSongs.bind(handler),
  },
  {
    method: 'GET',
    path: '/songs/{songId}',
    handler: handler.getSongById.bind(handler),
  },
  {
    method: 'PUT',
    path: '/songs/{songId}',
    handler: handler.updateSongById.bind(handler),
  },
  {
    method: 'DELETE',
    path: '/songs/{songId}',
    handler: handler.deleteSongById.bind(handler),
  },
];

module.exports = routes;
