const { app } = require("./app");
const sqlite3 = require("sqlite3").verbose();
const request = require("supertest");
const db = new sqlite3.Database(":memory:");
beforeAll(() => {
  //set the process.env.NODE_ENV to 'test' to make our app
  //listen to a different port than it does when the app is running in a nontest environment.
  process.env.NODE_ENV = "test";
});

const seedDb = (db) => {
  db.run(
    "CREATE TABLE IF NOT EXISTS persons (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)"
  );
  db.run("DELETE FROM persons");
  const stmt = db.prepare("INSERT INTO persons (name, age) VALUES (?, ?)");
  stmt.run("Jane", 1);
  stmt.finalize();
};

//test to get the existing seed data from the database with a GET request.
test("get persons", () => {
  db.serialize(async () => {
    //reset the database firstly
    seedDb(db);
    const res = await request(app).get("/");
    const response = [{ name: "Jane", id: 1, age: 1 }];
    expect(res.status).toBe(200);
    expect(res.body).toEqual(response);
  });
});
//test for the POST request. .
test("add person", () => {
  db.serialize(async () => {
    seedDb(db);
    await request(app).post("/").send({ name: "Joe", age: 2 });
    const res = await request(app).get("/");
    const response = [
      { name: "Jane", id: 1, age: 1 },
      { name: "Joe", id: 2, age: 2 },
    ];
    expect(res.status).toBe(200);
    expect(res.body).toEqual(response);
  });
});

//test for the PUT request
test("update person", () => {
  db.serialize(async () => {
    //reset the database firstly

    seedDb(db);
    await request(app).put("/1").send({ name: "Joe", age: 2 });
    const res = await request(app).get("/");
    const response = [{ name: "Jane", id: 1, age: 1 }];
    expect(res.status).toBe(200);
    expect(res.body).toEqual(response);
  });
});

//delete
test("delete person", () => {
  db.serialize(async () => {
    seedDb(db);
    const res = await request(app).delete("/1");
    const response = [];
    expect(res.status).toBe(200);
    expect(res.body).toEqual(response);
  });
});
