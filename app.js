const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const mime = require("mime");
const methodOverride = require("method-override");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

// Mongo URI
const mongoURI =
  "mongodb+srv://fghgfgfgh_5:UkDMFlwKc2C171oP@cluster0.b5vz0.mongodb.net/FileUploadDB?retryWrites=true&w=majority";
//mongoDB url
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;

conn.once("open", () => {
  // Init stream
  gfs = new Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Create storage engine
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
//
// uploade file route
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ file: req.file });
  // res.redirect('/');
});
app.get("/files/:fileName", (req, res) => {
  gfs.files.findOne({ fileName: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ error: "No file exit." });
    }
    return res.json(file);
  });
});
// get image
app.get("/image/:fileName", (req, res) => {
  gfs.files.findOne({ fileName: req.params.filename }, (err, file) => {
    if (!file || file.length === 0) {
      return res.status(404).json({ error: "No file exit." });
    }

    // if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
    const readStream = gfs.createReadStream(file.filename);
    readStream.on("open", () => {
      readStream.pipe(res);
    });
    readStream.on("error", function (err) {
      res.end(err);
    });
    // res.json(file);
    // } else {
    //   res.status(404).json({ error: "File is not formate for it." });
    // }
  });
});
app.get("/imaget/:filename", (req, res) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    // Check if file
    if (!file || file.length === 0) {
      return res.status(404).json({
        err: "No file exists",
      });
    }

    // Check if image
    if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
      // Read output to browser
      const readstream = gfs.createReadStream(file.filename);
      readstream.pipe(res);
    } else {
      res.status(404).json({
        err: "Not an image",
      });
    }
  });
});
app.get("/imageid/:fileName", async (req, res) => {
  const fileData = await gfs.files.findOne({ filename: req.params.fileName });
  let mimeType = fileData.contentType;
  if (!mimeType) {
    mimeType = mime.lookup(fileData.filename);
  }
  res.set({
    "Content-Type": mimeType,
    "Content-Disposition": "attachment; filename=" + fileData.filename,
  });
  console.log(fileData._id);
  gfs = new Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
  const readStream = await gfs.createReadStream(conn.db, fileData._id);
  // readStream.on("error", (err) => {
  //   // report stream error
  // });
  // // the response will be the file itself.
  // readStream.pipe(res);
  res.json(fileData);

  // gfs.files.findOne(
  //   {
  //     _id: req.params.id,
  //   },
  //   (err, file) => {
  //     if (err) {
  //       // report the error
  //     } else {
  //       console.log(file);
  //       // detect the content type and set the appropriate response headers.
  //       let mimeType = file.contentType;
  //       if (!mimeType) {
  //         mimeType = mime.lookup(file.filename);
  //       }
  //       res.set({
  //         "Content-Type": mimeType,
  //         "Content-Disposition": "attachment; filename=" + file.filename,
  //       });

  //       const readStream = gfs.createReadStream({
  //         _id: id,
  //       });
  //       readStream.on("error", (err) => {
  //         // report stream error
  //       });
  //       // the response will be the file itself.
  //       readStream.pipe(res);
  //     }
  //   }
  // );
});

app.get("/", (req, res) => {
  res.render("index");
});
app.get("/test", (req, res) => {
  res.json({ data: "Data send." });
});
const port = 8080;
app.listen(port, () => {
  console.log("8080 is ready to start...");
});
