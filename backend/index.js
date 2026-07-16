require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

const connectToServer = require("./database/connectToServer");

connectToServer();

const corsOptions = {
  origin: "http://localhost:5713",

  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
