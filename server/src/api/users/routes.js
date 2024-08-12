// eslint-disable-next-line no-unused-vars
const routes = (handler) => [
  {
    method: 'POST',
    path: '/users',
    handler: handler.signUp.bind(handler),
  },
];

module.exports = routes;
