class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async addSong(request, h) {
    const body = request.payload;

    this._validator.validateCreateOrUpdateSongPayload(body);

    const songId = await this._service.addSong(body);

    const response = h.response({
      status: 'success',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  // eslint-disable-next-line no-unused-vars
  async getSongs(request, h) {
    const { title, performer } = request.query;

    const songs = await this._service.getSongs(title, performer);

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  // eslint-disable-next-line no-unused-vars
  async getSongById(request, h) {
    const { songId } = request.params;

    const song = await this._service.getSongById(songId);

    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  // eslint-disable-next-line no-unused-vars
  async updateSongById(request, h) {
    const { songId } = request.params;
    const body = request.payload;

    this._validator.validateCreateOrUpdateSongPayload(body);

    await this._service.updateSongById(body, songId);

    return {
      status: 'success',
      message: 'Berhasil mengubah song',
    };
  }

  // eslint-disable-next-line no-unused-vars
  async deleteSongById(request, h) {
    const { songId } = request.params;

    await this._service.deleteSongById(songId);

    return {
      status: 'success',
      message: 'Berhasil menghapus song',
    };
  }
}

module.exports = SongsHandler;
