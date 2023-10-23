const express = require("express");
const cors = require('cors');
const { getTopics, getApi, getArticleById, getArticles, getCommentsByArticleId, deleteCommentById, getUsers, postComment, updateArticle } = require("./controller/controller.js");
const app = express();

app.use(cors());

app.use(express.json())

app.get("/api/topics", getTopics);

app.get('/api/articles/:article_id', getArticleById)

app.get('/api', getApi)

app.get('/api/articles', getArticles)

app.get("/api/articles/:article_id/comments", getCommentsByArticleId )

app.delete('/api/comments/:comment_id', deleteCommentById)

app.get('/api/users', getUsers)

app.post("/api/articles/:article_id/comments", postComment)

app.patch("/api/articles/:article_id", updateArticle)

app.all('/api/*', (req, res, next) => {
    res.status(404).send({ msg: 'path not found'})
  })

app.use((err, req, res, next) => {
    if(err.status){
     res.status(err.status).send({ msg: err.msg})
    } else {
      next(err)
    }
     })
  
app.use((err, req, res, next) => {
  if(err.code === '22P02' || '23502') {
    res.status(400).send({ msg: 'Bad request'})
  } else {
    next(err)
  }
  
  })

app.use((err, req, res, next) => {
  res.status(500).send({ msg: 'internal server error!'})
})




module.exports = app;
