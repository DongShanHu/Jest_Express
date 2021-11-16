// ref https://school.geekwall.in/p/fGhCDm_g/how-to-test-express-js-with-jest-and-supertest
//Express app that interacts with a sqlite3 with Jest
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const app = express();
const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
let db;
if (process.env.NODE_ENV === "test") {
  //test a db in memory
  db = new sqlite3.Database(":memory:");
} else {
  db = new sqlite3.Database("db.sqlite");
}
//create table firstly
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS persons (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)"
  );
});
//app.use()，以指定中介軟體函數。下列程式碼會在根路徑 (/)
// 路由之前先載入 myLogger 中介軟體函數。
app.use(bodyParser.json());
app.get("/", (req, res) => {
  db.serialize(() => {
    db.all("SELECT * FROM persons", [], (err, rows) => {
      res.json(rows);
    });
  });
});
app.post("/", (req, res) => {
  const { name, age } = req.body;
  db.serialize(() => {
    const stmt = db.prepare("INSERT INTO persons (name, age) VALUES (?, ?)");
    stmt.run(name, age);
    stmt.finalize();
    res.json(req.body);
  });
});
app.put("/:id", (req, res) => {
  const { name, age } = req.body;
  const { id } = req.params;
  db.serialize(() => {
    const stmt = db.prepare(
      "UPDATE persons SET name = ?, age = ? WHERE id = ?"
    );
    stmt.run(name, age, id);
    stmt.finalize();
    res.json(req.body);
  });
});
app.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.serialize(() => {
    const stmt = db.prepare("DELETE FROM persons WHERE id = ?");
    stmt.run(id);
    stmt.finalize();
    res.json(req.body);
  });
});
const server = app.listen(port);
module.exports = { app, server };
