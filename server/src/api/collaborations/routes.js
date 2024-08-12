// eslint-disable-next-line no-unused-vars
const routes = (handler) => [
  {
    method: 'POST',
    path: '/collaborations',
    handler: handler.addUserAsCollaborator.bind(handler),
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: handler.deleteUserFromCollborator.bind(handler),
    options: {
      auth: 'openmusic_jwt',
    },
  },
];

module.exports = routes;
