const { selectTopics, selectArticleById, fetchApi } = require('../model/model.js')
const endpoints = require('../../endpoints.json')

exports.getTopics = (req, res, next) => {
    selectTopics().then((topics) => {
        res.status(200).send({ topics })
    }).catch((err) => {
        next(err)
      })
}

exports.getArticleById = (req, res, next) => {
    const { article_id } = req.params;
    selectArticleById(article_id).then((article) => {
        res.status(200).send({ article })
    }).catch((err) => {
        console.log(err.code)
        next(err)
      })
    }
      
exports.getApi = (req, res) => {

   res.status(200).send({ endpoints })
        
}
