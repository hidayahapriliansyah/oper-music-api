class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async signUp(request, h) {
    const body = request.payload;

    this._validator.signUpUserPayload(body);

    const userId = await this._service.signUp({
      username: body.username,
      fullname: body.fullname,
      password: body.password,
    });

    const response = h.response({
      status: 'success',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
