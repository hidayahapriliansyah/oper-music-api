const InvariantError = require('../../exceptions/InvariantError');

class UploadsHandler {
  constructor(storageService, albumsService, validator) {
    this._storageService = storageService;
    this._albumsService = albumsService;
    this._validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    const { cover: file } = request.payload;

    if (!file) {
      throw new InvariantError('Property file must be cover');
    }

    const { albumId } = request.params;

    this._validator.validateImageHeaders(file.hapi.headers);

    await this._albumsService.checkAlbumExist(albumId);

    const fileLocation = await this._storageService.writeFile(file, file.hapi);

    await this._albumsService.updateAlbumCover(albumId, fileLocation);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });
    response.code(201);

    return response;
  }
}

module.exports = UploadsHandler;
