const db = require('../connection.js')


exports.selectTopics = () => {
    return db.query('SELECT * FROM topics;').then((result) => {
        return result.rows;
      });
}

exports.selectArticleById = (article_id) => {
    return db
      .query('SELECT *, CAST((SELECT COALESCE (SUM(comments.comment_id),0) FROM comments WHERE comments.article_id = articles.article_id) AS INT) AS comment_count FROM articles WHERE article_id = $1;', [article_id])
      .then((result) => {
        if(result.rows.length===0){
          return Promise.reject({ status: 404, msg: 'article does not exist' })
        } else {
        return result.rows[0];
       }
      });
    }

exports.selectArticles = (topic) => {

    let query = `SELECT articles.author, articles.article_id, articles.title, articles.topic, articles.votes, articles.created_at, articles.article_img_url, CAST(COUNT(comments.comment_id) AS INT) AS comment_count
     FROM articles 
     LEFT JOIN comments 
     ON comments.article_id = articles.article_id`
     const values = []
     
     if(topic) {
      query += ` WHERE articles.topic = $1
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC`
      values.push(topic)
     } 
     
     else {
      query += ` GROUP BY articles.article_id
      ORDER BY articles.created_at DESC`
     }

    return db
    .query(query, values)
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
      return result.rows;
     }
    )

  }
    
  exports.removeComment = (comment_id) => {
    return db.query('SELECT * FROM comments WHERE comments.comment_id = $1;', [comment_id])
  .then((result)=> {
    if (result.rows.length===0) {
      return Promise.reject({ status: 404, msg: 'comment does not exist' })
    } else {
      return db.query('DELETE FROM comments WHERE comments.comment_id = $1;', [comment_id]);
    }
  })
  }
    
  exports.selectUsers = () => {
    return db.query('SELECT * FROM users;').then((result) => {
        return result.rows;
      });
}

  exports.patchArticle = (article_id, inc_votes) => {
  
    return db.query(`UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`, [inc_votes, article_id]).then(({ rows }) => {
      return rows[0]
    })
  }

  exports.insertComment = ({ username, body }, article_id) => {

   return db
    .query(`INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *;`, [username, body, article_id])
    .then((result) => {
  
      if(result.rows.length===0){
        return Promise.reject({ status: 404, msg: 'article does not exist' })
      } else {
      return result.rows[0];
     }
    });
      }
   
 
   