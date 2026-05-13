const queue = require("bullmq");
const redisConfig = require("../config/redis");

const notifications = new queue.Queue("notifications", {
  connection: {
    host: "127.0.0.1",
    port: 6380,
  },
});
module.exports = notifications;
