const express = require("express");
const app = express();
const prisma = require("./prisma/client");
const authRouter = require("./routes/auth");
const authenticateToken = require("./middleware/auth");
const redis = require("./config/redis");
const notificationQueue = require("./queues/notificationQueues");
require("./workers/noificationWorker");
let nextId = 3;
redis.on("connect", () => {
  console.log("Redis connected.");
});
redis.on("error", (err) => {
  console.log("redis error.", err);
});
app.use(express.json()); // lets us read content json from request body
app.use("/auth", authRouter);

// Get all transactions
app.get("/transactions", authenticateToken, async (req, res) => {
  // 1. check redis first
  const transactionData = await redis.get("transactions");

  // 2. if found — parse it and return it
  if (transactionData !== null) {
    const parsedTransactionData = JSON.parse(transactionData);
    res.json({
      message: "Transactions fetched successfully",
      data: parsedTransactionData,
    });
  }
  // 3. if not found — fetch from prisma
  else {
    const transactions = await prisma.transaction.findMany();
    // 4. store in redis before returning
    await redis.set("transactions", JSON.stringify(transactions), "EX", 60);
    // 5. return the data
    res.json({
      message: "Transactions fetched successfully",
      data: transactions,
    });
  }
});

// GET specific transaction
app.get("/transactions/:id", authenticateToken, async (req, res) => {
  let id = Number(req.params.id);
  let specifictTransaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (specifictTransaction) {
    res.json({
      message: "Specific Transaction",
      data: specifictTransaction,
    });
  } else {
    res.status(404).json({ message: "Transaction not found" });
  }
});

// POST create one transaction
app.post("/transactions", authenticateToken, async (req, res) => {
  let data = req.body;
  console.log("data", data);
  if (!data.amount || !data.description || !data.type) {
    return res
      .status(400)
      .json({ message: "Please add amount,description and type" });
  }

  const created = await prisma.transaction.create({ data: { ...data } });
  await redis.del("transactions");
  await notificationQueue.add("send-email", {
    id: req.user.id,
    amount: created.amount,
    type: created.type,
  });
  // transactions.push(data);
  // nextId++;
  res
    .status(201)
    .json({ message: "Transaction added successfully", data: created });
});

// PUT update one transaction
app.put("/transactions/:id", authenticateToken, async (req, res) => {
  let transactionId = Number(req.params.id);
  let data = req.body;
  let updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: data,
  });
  await redis.del("transactions");

  return res
    .status(200)
    .json({ message: "Transaction updated successfully", data: data });
});

// DELETE delete specific a transaction
app.delete("/transactions/:id", authenticateToken, async (req, res) => {
  let transactionId = Number(req.params.id);

  try {
    await prisma.transaction.delete({ where: { id: transactionId } });
    await redis.del("transactions");

    return res
      .status(200)
      .json({ message: "Transaction deleted successfully" });
  } catch (error) {
    return res.status(404).json({ message: "Transaction not found" });
  }
});

app.listen(3200, () => {
  console.log("Server running at http://localhost:3200");
});

// const server = http.createServer((req, res) => {
//   console.log(`Incoming request: ${req.method} ${req.url}`);

//   res.writeHead(200, { "Content-Type": "application/json" });
//   res.end(JSON.stringify({ message: "Hello from your first Node server!" }));
// });

// server.listen(3000, () => {
//   console.log("Server running at http://localhost:3000");
// });
