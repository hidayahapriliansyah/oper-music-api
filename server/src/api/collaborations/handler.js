class CollaborationsHandler {
  constructor(collaborationsService, validator) {
    this._collaborationsService = collaborationsService;
    this._validator = validator;
  }

  async addUserAsCollaborator(request, h) {
    const { id: userId } = request.auth.credentials;

    const body = request.payload;

    this._validator.addUserAsCollaboratorPayload(body);

    const { userId: addedUserId, playlistId } = request.payload;

    const collabId = await this._collaborationsService
      .addUserAsCollaborator(userId, playlistId, addedUserId);

    const response = h.response({
      status: 'success',
      data: {
        collaborationId: collabId,
      },
    });
    response.code(201);
    return response;
  }

  // eslint-disable-next-line no-unused-vars
  async deleteUserFromCollborator(request, h) {
    const { id: userId } = request.auth.credentials;

    const body = request.payload;

    this._validator.deleteUserFromCollaboratorPayload(body);

    const { userId: deletedUserId, playlistId } = request.payload;

    await this._collaborationsService.deleteUserFromCollaborator(userId, playlistId, deletedUserId);

    return {
      status: 'success',
      message: 'Berhasil menghapus collaborator',
    };
  }
}

module.exports = CollaborationsHandler;
