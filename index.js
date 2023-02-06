//basic express.js
const express = require("express");
const app = express();
const port = 80;

// serve public folder
app.use(express.static("public"));

//start server
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
