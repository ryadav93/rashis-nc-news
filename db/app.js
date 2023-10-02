const express = require("express");
const { getTopics, getApi } = require("./controller/controller.js");
const app = express();

app.get("/api/topics", getTopics);

app.get('/api', getApi)

app.all('/api/*', (req, res, next) => {
    res.status(404).send({ msg: 'path not found'})
  })




module.exports = app;