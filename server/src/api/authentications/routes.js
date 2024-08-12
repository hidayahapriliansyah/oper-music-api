// eslint-disable-next-line no-unused-vars
const routes = (handler) => [
  {
    method: 'POST',
    path: '/authentications',
    handler: handler.signIn.bind(handler),
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: handler.getNewAccessToken.bind(handler),
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: handler.deleteAuthentication.bind(handler),
  },
];

module.exports = routes;
