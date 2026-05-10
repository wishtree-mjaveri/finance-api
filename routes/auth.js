const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../prisma/client");
const jsonwebtoken = require("jsonwebtoken");

const router = express.Router();

router.post("/register", async (req, resp) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return resp.status(400).json({ message: "Email & Password are required." });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRegistered = await prisma.user.create({
      data: { email: email, password: hashedPassword },
    });
    return resp.status(201).json({
      message: "New user registered successfully.",
      data: {
        email: userRegistered.email,
        createdAt: userRegistered.createdAt,
        id: userRegistered.id,
      },
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are rquired" });
  } else {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    } else {
      if (await bcrypt.compare(password, user.password)) {
        return res.status(200).json({
          token: jsonwebtoken.sign({ id: user.id }, "your-secret-key"),
        });
      } else {
        return res.status(401).json({ message: "Invalid Credentials." });
      }
    }
  }
});

module.exports = router;
