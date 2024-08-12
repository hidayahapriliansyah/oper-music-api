class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async addAlbum(request, h) {
    this._validator.validateCreateOrUpdateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: {
        albumId,
      },
    });
    response.code(201);
    return response;
  }

  // eslint-disable-next-line no-unused-vars
  async getAlbumById(request, h) {
    const { albumId } = request.params;
    const result = await this._service.getAlbumById(albumId);

    const response = h.response({
      status: 'success',
      data: {
        album: result.album,
      },
    });
    if (result.source === 'cache') {
      response.header('x-data-source', 'cache');
    }

    return response;
  }

  // eslint-disable-next-line no-unused-vars
  async updateAlbumById(request, h) {
    this._validator.validateCreateOrUpdateAlbumPayload(request.payload);
    const { albumId } = request.params;
    const { name, year } = request.payload;

    await this._service.updateAlbumById({ name, year, albumId });

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  // eslint-disable-next-line no-unused-vars
  async deleteAlbumById(request, h) {
    const { albumId } = request.params;

    await this._service.deleteAlbumById(albumId);

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async addLikeToAlbum(request, h) {
    const { id: userId } = request.auth.credentials;

    const { albumId } = request.params;

    await this._service.addLikeToAlbum(userId, albumId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menyukai album',
    });
    response.code(201);
    return response;
  }

  // eslint-disable-next-line no-unused-vars
  async getTotalAlbumLikes(request, h) {
    const { albumId } = request.params;

    const result = await this._service.getTotalAlbumLikes(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes: result.totalLikes,
      },
    });
    if (result.source === 'cache') {
      response.header('x-data-source', 'cache');
    }

    return response;
  }

  // eslint-disable-next-line no-unused-vars
  async deleteLikeFromAlbum(request, h) {
    const { id: userId } = request.auth.credentials;

    const { albumId } = request.params;

    await this._service.deleteLikeFromAlbum(userId, albumId);

    return {
      status: 'success',
      message: 'Berhasil membatalkan like pada album',
    };
  }
}

module.exports = AlbumsHandler;
