const express = require("express");
const app = express();
const prisma = require("./prisma/client");
let nextId = 3;

app.use(express.json()); // lets us read content json from request body

// Get all transactions
app.get("/transactions", async (req, res) => {
  const transactions = await prisma.transaction.findMany();
  res.json({
    message: "Transactions fetched successfully",
    data: transactions,
  });
});

// GET specific transaction
app.get("/transactions/:id", async (req, res) => {
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
app.post("/transactions", async (req, res) => {
  let data = req.body;
  console.log("data", data);
  if (!data.amount || !data.description || !data.type) {
    return res
      .status(400)
      .json({ message: "Please add amount,description and type" });
  }

  const created = await prisma.transaction.create({ data: { ...data } });
  // transactions.push(data);
  // nextId++;
  res
    .status(201)
    .json({ message: "Transaction added successfully", data: created });
});

// PUT update one transaction
app.put("/transactions/:id", async (req, res) => {
  let transactionId = Number(req.params.id);
  let data = req.body;
  let updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: data,
  });

  return res
    .status(200)
    .json({ message: "Transaction updated successfully", data: data });
});

// DELETE delete specific a transaction
app.delete("/transactions/:id", async (req, res) => {
  let transactionId = Number(req.params.id);

  try {
    await prisma.transaction.delete({ where: { id: transactionId } });
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
