const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();
connectDB();
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_PATH_PROD
      : process.env.CLIENT_PATH_DEV,
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// test route
app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customer", require("./routes/customerRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/meter-reader",require("./routes/meterReaderRoutes"))
app.use("/api/bill", require("./routes/billRoutes"));
app.use("/api/meter-readings", require("./routes/meterRoutes"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
