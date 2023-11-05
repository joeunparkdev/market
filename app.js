const express = require("express");
const app = express();
const routes = require("./routes/products.router");
const connect = require("./schemas");
require('dotenv').config();

connect();

app.use(express.json());

app.use("/api", routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
