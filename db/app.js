const express = require("express");
const { getTopics, getArticleById } = require("./controller/controller.js");
const app = express();

app.get("/api/topics", getTopics);

app.get('/api/articles/:article_id', getArticleById)

app.all('/api/*', (req, res, next) => {
    res.status(404).send({ msg: 'path not found'})
  })

app.use((err, req, res, next) => {
    if(err.status){
     res.status(err.status).send({ msg: err.msg})
    }
  next(err)
     })
  
  app.use((err, req, res, next) => {
   res.status(400).send({ msg: 'Bad request'})
  })


module.exports = app;
