const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");
require("dotenv/config");

const app = express();

//middleware
//app.use(bodyParser.json());
app.use(methodOverride("_method"));

app.set("view engine", "ejs");

// Mongo URI

const mongoURI = process.env.DB_CONNECTION;

//Create mongo connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

//Init GridFS
let gfs;

conn.once("open", () => {
  //init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

//@route GET /
//@desc Loads form
app.get("/", (req, res) => {
  res.render("index");
});

// @route POST /upload
// @desc uploads file to db

app.post("/upload", upload.single("file"), (req, res) => {
  //res.json({ file: req.file });

  res.redirect("/");
});

// @route GET /files
// @ desc display all files in json
app.get("/files", (req, res) => {
  gfs.files.find().toArray((err, files) => {
    //Check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "No files exist",
      });
    }

    // Files exist
    return res.json(files);
  });
});

// @route GET /files/:filename
// @ desc display single file object
app.get("/files/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exist",
      });
    }

    //file exists
    return res.json(file);
  });
});

// @route GET /image/:filename
// @ desc display image
app.get("/image/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exist",
      });
    }

    // check if its an image
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      // Read output to browser
      const readStream = gfs.createReadStream(file.filename);
      readStream.pipe(res);
    } else {
      res.status(404).json({ err: "Not an image" });
    }
  });
});

const port = 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
