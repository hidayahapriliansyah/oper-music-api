const routes = (handler) => [
  {
    method: 'POST',
    path: '/albums',
    handler: handler.addAlbum.bind(handler),
  },
  {
    method: 'GET',
    path: '/albums/{albumId}',
    handler: handler.getAlbumById.bind(handler),
  },
  {
    method: 'PUT',
    path: '/albums/{albumId}',
    handler: handler.updateAlbumById.bind(handler),
  },
  {
    method: 'DELETE',
    path: '/albums/{albumId}',
    handler: handler.deleteAlbumById.bind(handler),
  },
  {
    method: 'POST',
    path: '/albums/{albumId}/likes',
    handler: handler.addLikeToAlbum.bind(handler),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'GET',
    path: '/albums/{albumId}/likes',
    handler: handler.getTotalAlbumLikes.bind(handler),
  },
  {
    method: 'DELETE',
    path: '/albums/{albumId}/likes',
    handler: handler.deleteLikeFromAlbum.bind(handler),
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
