import emocks, { EmocksOptions } from "../src";
import express from "express";
import * as path from "path";
import request from "supertest";
import * as fs from "fs";
import rimraf from "rimraf";

const MOCKS_PATH = "../examples/mocks";

const promisify = (req: request.Request) =>
  new Promise((resolve, reject) => {
    req.end((err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });

describe("Emocks runs", function () {
  beforeEach(function (done) {
    fs.mkdir("tmp", done);
  });
  afterEach(function (done) {
    rimraf("tmp", done);
  });
  function createApp(
    options?: EmocksOptions,
    pathPas = path.join(__dirname, MOCKS_PATH)
  ) {
    const app = express();
    app.use("/", emocks(pathPas, options));
    return app;
  }
  it("GET /", function (done) {
    const app = createApp();
    request(app).get("/").expect(200).end(done);
  });
  it("POST and status /", function (done) {
    const app = createApp();
    request(app).post("/").expect(201).end(done);
  });
  it("Headers", function (done) {
    const app = createApp({
      headers: {
        "X-Test": "test",
      },
    });
    request(app)
      .get("/users")
      .expect("X-Test", "test")
      .expect("X-Custom-Header", "Lol")
      .expect(200)
      .end(done);
  });
  it("Delay", function (done) {
    const app = createApp({
      delay: 100,
    });
    request(app).get("/").expect(200).end(done);
  });
  it("js response", function (done) {
    const app = createApp({});
    request(app)
      .get("/users/3")
      .expect(200, {
        id: 1,
        name: "John",
      })
      .end(done);
  });
  it("404", async function () {
    const app = createApp({
      404: function (_req, res) {
        res.status(404).send();
      },
    });
    await promisify(request(app).get("/unknown").expect(404));

    const app2 = createApp();
    await promisify(
      request(app2).get("/unknown").expect(404, { error: "Mock not found" })
    );
  });
});
