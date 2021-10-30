const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const mime = require("mime");
const methodOverride = require("method-override");
const fileUpload = require("express-fileupload");
const AWS = require("aws-sdk");
const cors = require("cors");
const fs = require("fs");

const app = express();

// AWS.config.update({
//   accessKeyId: "AKIAXERUSCJ5ABUCHPUE",
//   secretAccessKey: "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",
//   region: process.env.AWS_REGION,
// });
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_TOKEN,
  secretAccessKey: process.env.AWS_SECRET_TOKEN,
  region: process.env.AWS_REGION,
});
const s3 = new AWS.S3();

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(fileUpload());
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");

  res.header(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    return res.status(200).json({});
  }

  next();
});

const storage = multer.memoryStorage({
  destination: () => {
    callback(null, "");
  },
});
const upload = multer({ storage }).single("image");

app.post("/upload", upload, (req, res) => {
  const file = req.files.image;
  console.log(file);
  const fileSplit = file.name.split(".");
  const fileType = fileSplit[fileSplit.length - 1];
  const fileName = `${new Date().getTime()}.${fileType}`;
  const param = {
    Bucket: process.env.AWS_BUCKET,
    Key: fileName,
    Body: file?.data,
    ACL: "public-read",
    ContentType: file.mimetype,
  };
  s3.putObject(param, async function (err, data) {
    if (err) {
      throw err;
    } else if (data) {
      s3.getSignedUrl(
        "getObject",
        {
          Bucket: param.Bucket,
          Key: fileName,
          Expires: 60 * 5,
        },
        function (err, url) {
          if (err) {
            res.json({ data: err });
          } else if (url) {
            console.log(url);
            res.json({ data: url, fileName });
          }
        }
      );

      // s3.getObject(
      //   { Bucket: param.Bucket, Key: param.Key },
      //   function (err, data) {
      //     if (err) {
      //       return res.send({ error: err });
      //     } else if (data) {
      //       console.log(data);
      //       res.json({ data });
      //     }
      //   }
      // );
    }
  });

  // var fileStream = fs.createReadStream(file.name);
  // fileStream.on("error", function (err) {
  //   if (err) {
  //     res.json({ data: err });
  //   }
  // });
  // fileStream.on("open", function () {

  // });
  //
  // const params = {
  //   Bucket: "faire",
  //   key: `${`rest`}.${fileType}`,
  //   Body: file.data,
  // };
  // s3.upload(params, (error, data) => {
  //   if (error) {
  //     res.json({ error });
  //   } else if (data) {
  //     res.json({ data: data });
  //   }
  // });

  // res.send({ data: req.files });
});

// create bucket
app.post("/createBucket", (req, res) => {
  const { Bucket } = req.body;
  const params = {
    Bucket,
  };
  // res.json({ params });
  s3.createBucket(params, (err, data) => {
    if (err) {
      res.json({ err });
    } else if (data) res.json({ data });
  });
});
// CREATE bucket
app.delete("/deleteBucket", (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
  };
  s3.deleteBucket(params, (err, data) => {
    if (err) {
      res.json({ err });
    } else if (data) res.json({ data });
  });
});
// list of bucket
app.get("/listBucket", (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
  };
  s3.listBuckets({}, (err, data) => {
    if (err) {
      res.json({ err });
    } else if (data) res.json({ data });
  });
});
app.get("/listObject", (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
  };
  s3.listObjects(params, (err, data) => {
    if (err) {
      res.json({ err });
    } else if (data) res.json({ data });
  });
});

// delete object
app.get("/deleteObject", (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: "1635444275666.png",
  };
  s3.deleteObject(params, (err, data) => {
    if (err) {
      res.json({ err });
    } else if (data) res.json({ data });
  });
});
// delete multipule objects
app.get("/deleteObjects", (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Delete: {
      Objects: [
        {
          Key: "1635438553995.png",
        },
        {
          Key: "1635438790483.png",
        },
        {
          Key: "1635443964331.png",
        },
        {
          Key: "1635444189807.png",
        },
        {
          Key: "1635444228407.png",
        },
      ],
    },
  };
  s3.deleteObjects(params, (err, data) => {
    if (err) {
      res.json({ err });
    } else if (data) res.json({ data });
  });
});
app.get("/getSignUrl", (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: "1635523791344.png",
  };
  const url = s3.getSignedUrl("getObject", params);
  console.log(url);
  res.json({ data: url });
});
// set cors aws
app.get("/cors", (req, res) => {
  var params = {
    Bucket: process.env.AWS_BUCKET,
    CORSConfiguration: {
      CORSRules: [
        {
          AllowedHeaders: ["*"],
          AllowedMethods: ["PUT", "POST", "DELETE"],
          AllowedOrigins: ["http://www.example.com"],
          ExposeHeaders: ["x-amz-server-side-encryption"],
          MaxAgeSeconds: 3000,
        },
        {
          AllowedHeaders: ["Authorization"],
          AllowedMethods: ["GET"],
          AllowedOrigins: ["*"],
          MaxAgeSeconds: 3000,
        },
      ],
    },
    ContentMD5: "",
  };
  s3.putBucketCors(params, (err, data) => {
    if (err) {
      res.json({ err });
    } else if (data) res.json({ data });
  });
});
app.get("/getCors", (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
  };
  s3.getBucketCors(params, (err, data) => {
    if (err) {
      res.json({ err });
    } else if (data) res.json({ data });
  });
});
app.delete("/deleteCors", (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
  };
  s3.deleteBucketCors(params, (err, data) => {
    if (err) {
      res.json({ err });
    } else if (data) res.json({ data });
  });
});
app.get("/policyAdd", (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET,
    Policy: `{
      "Version": "2012-10-17",
      "Statement": [
          {
              "Sid": "PublicReadGetObject",
              "Effect": "Allow",
              "Principal": "*",
              "Action": [
                  "s3:GetObject"
              ],
              "Resource": [
                  "arn:aws:s3:::ranjit-123/*"
              ],
              
      ]
  }
    
    `,
  };
  s3.putBucketPolicy(params, (err, data) => {
    if (err) {
      res.json({ err });
    } else if (data) res.json({ data });
  });
});
// app.use(methodOverride("_method"));
// app.set("view engine", "ejs");

// Mongo URI
// const mongoURI =
//   "mongodb+srv://fghgfgfgh_5:UkDMFlwKc2C171oP@cluster0.b5vz0.mongodb.net/FileUploadDB?retryWrites=true&w=majority";
// //mongoDB url
// const conn = mongoose.createConnection(mongoURI);

// // Init gfs
// let gfs;

// conn.once("open", () => {
//   // Init stream
//   gfs = new Grid(conn.db, mongoose.mongo);
//   gfs.collection("uploads");
// });

// // Create storage engine
// const storage = new GridFsStorage({
//   url: mongoURI,
//   file: (req, file) => {
//     return new Promise((resolve, reject) => {
//       crypto.randomBytes(16, (err, buf) => {
//         if (err) {
//           return reject(err);
//         }
//         const filename = buf.toString("hex") + path.extname(file.originalname);
//         const fileInfo = {
//           filename: filename,
//           bucketName: "uploads",
//         };
//         resolve(fileInfo);
//       });
//     });
//   },
// });
// const upload = multer({ storage });
// //
// // uploade file route
// app.post("/upload", upload.single("file"), (req, res) => {
//   res.json({ file: req.file });
//   // res.redirect('/');
// });
// app.get("/files/:fileName", (req, res) => {
//   gfs.files.findOne({ fileName: req.params.filename }, (err, file) => {
//     if (!file || file.length === 0) {
//       return res.status(404).json({ error: "No file exit." });
//     }
//     return res.json(file);
//   });
// });
// // get image
// app.get("/image/:fileName", (req, res) => {
//   gfs.files.findOne({ fileName: req.params.filename }, (err, file) => {
//     if (!file || file.length === 0) {
//       return res.status(404).json({ error: "No file exit." });
//     }

//     // if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
//     const readStream = gfs.createReadStream(file.filename);
//     readStream.on("open", () => {
//       readStream.pipe(res);
//     });
//     readStream.on("error", function (err) {
//       res.end(err);
//     });
//     // res.json(file);
//     // } else {
//     //   res.status(404).json({ error: "File is not formate for it." });
//     // }
//   });
// });
// app.get("/imaget/:filename", (req, res) => {
//   gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
//     // Check if file
//     if (!file || file.length === 0) {
//       return res.status(404).json({
//         err: "No file exists",
//       });
//     }

//     // Check if image
//     if (file.contentType === "image/jpeg" || file.contentType === "image/png") {
//       // Read output to browser
//       const readstream = gfs.createReadStream(file.filename);
//       readstream.pipe(res);
//     } else {
//       res.status(404).json({
//         err: "Not an image",
//       });
//     }
//   });
// });
// app.get("/imageid/:fileName", async (req, res) => {
//   const fileData = await gfs?.files?.findOne({ filename: req.params.fileName });

//   // let mimeType = fileData?.contentType;
//   // if (mimeType) {
//   //   mimeType = mime.lookup(fileData?.filename);
//   //   res.set({
//   //     "Content-Type": mimeType,
//   //     "Content-Disposition": "attachment; filename=" + fileData?.filename,
//   //   });
//   // }

//   console.log(fileData?._id);
//   gfs = new Grid(conn.db, mongoose);
//   return res.json({ data: gfs });
//   gfs.collection("uploads");
//   const readStream = await gfs.createReadStream(conn.db, fileData._id);

//   // readStream.on("error", (err) => {
//   //   // report stream error
//   // });
//   // // the response will be the file itself.
//   // readStream.pipe(res);
//   res.json(fileData);

//   // gfs.files.findOne(
//   //   {
//   //     _id: req.params.id,
//   //   },
//   //   (err, file) => {
//   //     if (err) {
//   //       // report the error
//   //     } else {
//   //       console.log(file);
//   //       // detect the content type and set the appropriate response headers.
//   //       let mimeType = file.contentType;
//   //       if (!mimeType) {
//   //         mimeType = mime.lookup(file.filename);
//   //       }
//   //       res.set({
//   //         "Content-Type": mimeType,
//   //         "Content-Disposition": "attachment; filename=" + file.filename,
//   //       });

//   //       const readStream = gfs.createReadStream({
//   //         _id: id,
//   //       });
//   //       readStream.on("error", (err) => {
//   //         // report stream error
//   //       });
//   //       // the response will be the file itself.
//   //       readStream.pipe(res);
//   //     }
//   //   }
//   // );
// });

// app.get("/", (req, res) => {
//   res.render("index");
// });
// app.post("/test", (req, res) => {
//   res.setHeader("Content-Type", "text/html");
//   if (req.files === null) {
//     return res.status(400).json({ error: "No upload file." });
//   }

//   const file = req.files.file;
//   const fileSplit = file.name.split(".");
//   const fileType = fileSplit[fileSplit.length - 1];

//   const params = {
//     Bucket: "faire",
//     key: `${new Date().getTime()}.${fileType}`,
//     Body: file.data,
//     // ContentType: "image/png",
//     // ContentEncoding: "gzip",
//   };

//   s3.upload(params, (err, data) => {
//     if (err) {
//       return res.json({ error: err });
//     }

//     return res.json({ data: data });
//   });
//   // res.json({ data: file.data });
//   // return;
//   // file.mv(`${__dirname}/client/public/upload/${file.name}`, (error) => {
//   //   if (error) {
//   //     console.log(error);
//   //     return res.json({ error: error });
//   //   }
//   //   res.json({ filename: file.name, filePath: `/upload/${file.name}` });
//   // });
// });
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("8080 is ready to start...");
});
