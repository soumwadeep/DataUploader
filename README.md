# Excel to MySQL Uploader

This project is a web application that allows users to upload Excel files (.xlsx or .xls) and inserts the data into a MySQL database. The application uses Node.js, Express, Multer for handling file uploads, the `xlsx` package for parsing Excel files, and MySQL for the database.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Code Overview](#code-overview)
- [Dependencies](#dependencies)
- [License](#license)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/soumwadeep/DataUploader.git
   cd DataUploader
   ```

2. **Install dependencies:**

   Ensure you have Node.js and npm installed, then run:

   ```bash
   npm install
   ```

3. **Set up MySQL:**

   Create a MySQL database and table. For example:

   ```sql
   CREATE DATABASE your_database;

   USE your_database;

   CREATE TABLE your_table (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255),
       age INT,
       email VARCHAR(255)
   );
   ```

   Update the MySQL connection details in `server.js`:

   ```js
   const db = mysql.createConnection({
     host: "localhost",
     user: "your-username",
     password: "your-password",
     database: "your-database",
   });
   ```

4. **Run the server:**

   ```bash
   node server.js
   ```

   The server will start on port 3000.

## Usage

1. **Navigate to the application:**

   Open your web browser and go to `http://localhost:3000`.

2. **Upload an Excel file:**

   - Click on the "Choose File" button.
   - Select an Excel file (`.xlsx` or `.xls`).
   - Click on the "Upload" button.

3. **Check the database:**

   The data from the Excel file should be inserted into your MySQL table.

## Project Structure

```

excel-to-mysql-uploader/
├── public/
│ └── index.html
├── uploads/
├── server.js
├── package.json
└── README.md

```

- **public/**: Contains static files, including the HTML form for file uploads.
- **uploads/**: Directory where uploaded files are temporarily stored.
- **server.js**: Main server file containing the Express setup, file upload handling, and MySQL insertion logic.
- **package.json**: Contains project dependencies and scripts.
- **README.md**: Project documentation.

## Code Overview

### `server.js`

- **Express Setup:**

  ```js
  const express = require("express");
  const app = express();
  const port = 3000;

  app.use(express.static("public"));

  app.listen(port, () => console.log(`Server started on port ${port}`));
  ```

- **MySQL Connection:**

  ```js
  const mysql = require("mysql");

  const db = mysql.createConnection({
    host: "localhost",
    user: "your-username",
    password: "your-password",
    database: "your-database",
  });

  db.connect((err) => {
    if (err) throw err;
    console.log("MySQL connected...");
  });
  ```

- **Multer Setup:**

  ```js
  const multer = require("multer");
  const path = require("path");

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
      const filetypes = /xlsx|xls/;
      const extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );
      const mimetype =
        file.mimetype ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.mimetype === "application/vnd.ms-excel";

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb("Error: Excel Files Only!");
      }
    },
  }).single("excelFile");
  ```

- **File Upload Handling and Data Insertion:**

  ```js
  const xlsx = require("xlsx");

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
    const xlData = xlsx.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );

    xlData.forEach((row) => {
      const query = "INSERT INTO your_table SET ?";
      db.query(query, row, (err, result) => {
        if (err) throw err;
        console.log(result);
      });
    });
  }
  ```

## Dependencies

- [Express](https://expressjs.com/): Fast, unopinionated, minimalist web framework for Node.js
- [Multer](https://github.com/expressjs/multer): Node.js middleware for handling `multipart/form-data`, which is primarily used for uploading files
- [MySQL](https://www.npmjs.com/package/mysql): A Node.js driver for MySQL
- [xlsx](https://www.npmjs.com/package/xlsx): A library to parse and write Excel files

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```

This `README.md` file provides a comprehensive overview of your project, including setup instructions, usage guidelines, a code overview, and information about dependencies and licensing. Adjust the details (such as GitHub repository link, MySQL credentials, and table structure) to fit your specific project needs.
```
