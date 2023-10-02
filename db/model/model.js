const db = require('../connection.js')

exports.selectTopics = () => {
    return db.query('SELECT * FROM topics;').then((result) => {
        return result.rows;
      });
}

exports.selectArticleById = (article_id) => {
    return db
      .query('SELECT * FROM articles WHERE article_id = $1;', [article_id])
      .then((result) => {
        if(result.rows.length===0){
          return Promise.reject({ status: 404, msg: 'article does not exist' })
        } else {
        return result.rows[0];
       }
      });
    }