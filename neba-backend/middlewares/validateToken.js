const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  // const token = req.cookies['token'];
  // get token from authorization header
  // Get the token from the Authorization header
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  // Extract the token from the "Bearer" scheme
  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = validateToken;

// Note: jwt was econded as: { _id: user._id, email: user.email }
