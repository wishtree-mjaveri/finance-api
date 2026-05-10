const ioredis = require("ioredis");

const ioredisConnection = new ioredis({ port: 6380 });
module.exports = ioredisConnection;
