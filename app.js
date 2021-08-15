const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFSStroage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
require("dotenv/config");

const app = express();

//middleware
app.user(bodyParser.json());
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

// Mongo URI

const mongoURI = DB_CONNECTION;

app.get("/", (req, res) => {
  res.render("index");
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
