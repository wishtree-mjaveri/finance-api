const { Worker } = require("bullmq");

const worker = new Worker(
  "notifications",
  async (job) => {
    console.log(`Processing job: ${job.name}`);
    console.log(`Job data:`, job.data);

    // In real app — send email here
    // For now we just log it
    console.log(
      `Email sent to user ${job.data.id} — transaction of ${job.data.amount} (${job.data.type})`,
    );
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6380,
    },
  },
);
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed:`, err.message);
});

module.exports = worker;
