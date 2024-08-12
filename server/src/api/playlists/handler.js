class PlaylistsHandler {
  constructor(playlistsService, validator) {
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  async addPlaylist(request, h) {
    const { id: userId } = request.auth.credentials;

    const body = request.payload;

    this._validator.createPlaylistPayload(body);

    const playlistId = await this._playlistsService.addPlaylist(userId, body.name);

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  // eslint-disable-next-line no-unused-vars
  async getPlaylist(request, h) {
    const { id: userId } = request.auth.credentials;

    const playlists = await this._playlistsService.getPlaylist(userId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  // eslint-disable-next-line no-unused-vars
  async deletePlaylist(request, h) {
    const { id: userId } = request.auth.credentials;

    const { playlistId } = request.params;

    await this._playlistsService.deletePlaylist(userId, playlistId);

    return {
      status: 'success',
      message: 'Berhasil menghapus playlist',
    };
  }

  async addSongToPlaylist(request, h) {
    const { id: userId } = request.auth.credentials;

    const { playlistId } = request.params;

    const body = request.payload;
    this._validator.addSongToPlaylistPayload(body);

    await this._playlistsService.addSongToPlaylist(userId, playlistId, body.songId);

    const response = h.response({
      status: 'success',
      message: 'Berhasil menambahkan song ke dalam playlist',
    });
    response.code(201);
    return response;
  }

  // eslint-disable-next-line no-unused-vars
  async getSongsFromPlaylist(request, h) {
    const { id: userId } = request.auth.credentials;

    const { playlistId } = request.params;

    const result = await this._playlistsService.getSongsFromPlaylist(userId, playlistId);
    return {
      status: 'success',
      data: result,
    };
  }

  // eslint-disable-next-line no-unused-vars
  async deleteSongFromPlaylist(request, h) {
    const { id: userId } = request.auth.credentials;

    const { playlistId } = request.params;

    const body = request.payload;
    this._validator.deleteSongFromPlaylistPayload(body);

    await this._playlistsService.deleteSongFromPlaylist(userId, playlistId, body.songId);

    return {
      status: 'success',
      message: 'Berhasil menghapus song dari playlist',
    };
  }

  // eslint-disable-next-line no-unused-vars
  async getPlaylistActivities(request, h) {
    const { id: userId } = request.auth.credentials;

    const { playlistId } = request.params;

    const result = await this._playlistsService.getPlaylistActivities(userId, playlistId);

    return {
      status: 'success',
      data: result,
    };
  }
}

module.exports = PlaylistsHandler;
