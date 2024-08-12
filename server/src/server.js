const createServer = require('./createServer');

const init = async () => {
  const server = await createServer();
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
