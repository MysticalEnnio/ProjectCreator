require("dotenv").config();
//basic express.js
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// serve public folder
app.use(express.static("public"));

//start server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
