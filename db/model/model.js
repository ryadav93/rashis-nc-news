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

    exports.selectArticles = () => {

      const query = (`SELECT articles.author, articles.article_id, articles.title, articles.topic, articles.votes, articles.created_at, articles.article_img_url, CAST(COUNT(comments.comment_id) AS INT) AS comment_count
      FROM articles 
      LEFT JOIN comments 
      ON comments.article_id = articles.article_id 
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC;`)
    return db
    .query(query)
    .then(({ rows }) => {
      return rows;
    });
    }

  exports.selectCommentsByArticleId = (article_id) => {
    return db
    .query('SELECT * FROM comments WHERE comments.article_id = $1 ORDER BY comments.created_at DESC;', [
      article_id
    ])
    .then((result) => {
      
      if(result.rows.length===0){
        return Promise.reject({ status: 404, msg: 'article does not exist' })
      } else {

      return result.rows;
     }
    });

  }
    