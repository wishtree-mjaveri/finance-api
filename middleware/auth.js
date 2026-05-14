const jsonwebtoken = require("jsonwebtoken");
const redis = require("../config/redis");
async function authenticateToken(request, response, next) {
  const token = request.headers["authorization"]?.split(" ")[1];
  const blackListedTokens = await redis.get(`blackList:${token}`);
  console.log("blackListedTokens", blackListedTokens);
  if (blackListedTokens != null) {
    return response.status(403).json({ message: "Invalid Token" });
  }
  if (!token) {
    return response.status(401).json({ message: "No token provided" });
  } else {
    try {
      const decoded = jsonwebtoken.verify(token, "your-secret-key");
      request.user = decoded;
      next();
    } catch (error) {
      return response.status(403).json({ message: "Invalid Token" });
    }
  }
}

module.exports = authenticateToken;
