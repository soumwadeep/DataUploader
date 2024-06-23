const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const mysql = require("mysql");
const path = require("path");

const app = express();
const port = 3000;

// MySQL connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: "your-username",
  password: "your-password",
  database: "your-database",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL connected...");
});

// Set up storage for Multer
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
}).single("excelFile");

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /xlsx|xls/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype =
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.mimetype === "application/vnd.ms-excel";

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Excel Files Only!");
  }
}

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      if (req.file == undefined) {
        res.status(400).send("No file selected!");
      } else {
        const filePath = `./uploads/${req.file.filename}`;
        importExcelData2MySQL(filePath);
        res.send("File uploaded and data inserted!");
      }
    }
  });
});

function importExcelData2MySQL(filePath) {
  const workbook = xlsx.readFile(filePath);
  const sheet_name_list = workbook.SheetNames;
  const xlData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);

  xlData.forEach((row) => {
    const query = "INSERT INTO your_table_name SET ?";
    db.query(query, row, (err, result) => {
      if (err) throw err;
      console.log(result);
    });
  });
}

app.listen(port, () => console.log(`Server started on port ${port}`));
