const jsonwebtoken = require("jsonwebtoken");
function authenticateToken(request, response, next) {
  const token = request.headers["authorization"]?.split(" ")[1];
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
