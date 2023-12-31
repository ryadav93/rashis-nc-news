const db = require("../db/connection.js");
const app = require("../db/app.js");
const request = require("supertest");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const endpoints = require('../endpoints.json')
const sorted = require('jest-sorted')

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  db.end();
});

describe('/api/topics', () => {
    test('GET: 200 status code and sends an array of topics to the client', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((response) => {
            expect(response.body.topics.length).toBe(3)
            response.body.topics.forEach((topic) => {
                expect(typeof topic.description).toBe('string');
                expect(typeof topic.slug).toBe('string');
            })
        })
    })
    test('GET: 404 status code and error message when given wrongly spelt endpoint or invalid endpoint', () => {
        return request(app)
        .get('/api/toooopicss')
        .expect(404)
        .then((response) => {
        expect(response.body.msg).toBe('path not found');
          });
        
    })
    test('GET: 404 status code and error message when given an invalid endpoint', () => {
        return request(app)
        .get('/api/meat')
        .then((response) => {
        expect(response.body.msg).toBe('path not found');
      });
    })
})

describe('/api', () => {
    test('GET: /api returns an object of objects with information about all the available endpoints', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {
            expect(response.body.endpoints).toEqual(endpoints)
        })
    })

})

describe('/api/articles/:article_id', () => {
    test('GET: 200 sends a single article object to the client', () => {
        return request(app)
        .get("/api/articles/3")
        .expect(200)
        .then((response) => {
            expect(response.body.article.article_id).toBe(3)
            expect(response.body.article.author).toBe("icellusedkars")
            expect(response.body.article.title).toBe("Eight pug gifs that remind me of mitch")
            expect(response.body.article.body).toBe("some gifs")
            expect(response.body.article.topic).toBe("mitch")
            expect(response.body.article.votes).toBe(0)
            expect(response.body.article.created_at).toBe("2020-11-03T09:12:00.000Z")
            expect(response.body.article.article_img_url).toBe( "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700")
        })
    })
    test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
        return request(app)
          .get('/api/articles/999')
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe('article does not exist');
          });
      });
      test('GET:400 sends an appropriate status and error message when given an invalid id', () => {
        return request(app)
          .get('/api/articles/not-an-article')
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe('Bad request');
          });
      });
      test('PATCH: 200 responds with updated article when incremented by certain number of votes', () => {
        const articleUpdate = { inc_votes: 1 }
        return request(app)
        .patch('/api/articles/1')
        .send(articleUpdate)
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toMatchObject({title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 101,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"})
        })
      })
      test('PATCH: 200 responds with updated article when decremented by certain number of votes', () => {
        const articleUpdate = { inc_votes: -100 }
        return request(app)
        .patch('/api/articles/1')
        .send(articleUpdate)
        .expect(200)
        .then(({ body }) => {
          expect(body.article).toMatchObject({title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"})
        })
      })
      test('PATCH: 400 for missing votes', () => {
        const articleUpdate = {}
        return request(app)
        .patch('/api/articles/1')
        .send(articleUpdate)
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe('Bad request');
        });

      })
      test('PATCH: 400 if votes is not a number', () => {
        const articleUpdate = {inc_votes: 'banana'}
        return request(app)
        .patch('/api/articles/1')
        .send(articleUpdate)
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe('Bad request');
        });

      })
      test('PATCH:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
        const articleUpdate = { inc_votes: -100 }
        return request(app)
          .patch('/api/articles/999')
          .send(articleUpdate)
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe('article does not exist');
          });
      });
      test('PATCH:400 sends an appropriate status and error message when given an invalid id', () => {
        const articleUpdate = { inc_votes: -100 }
        return request(app)
          .patch('/api/articles/not-an-article')
          .send(articleUpdate)
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe('Bad request');
          });
      });
    
})

describe('/api/articles', () => {
  test('GET: 200 status code and sends an array of article objects sorted by date to the client in descending order with a comment count', () => {
      return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
          expect(body.articles.length).toBe(13)
          body.articles.forEach((article) => {
            expect(typeof article.author).toBe("string")
            expect(typeof article.article_id).toBe('number')
            expect(typeof article.title).toBe("string")
            expect(typeof article.topic).toBe("string")
            expect(typeof article.votes).toBe('number')
            expect(typeof article.created_at).toBe("string")
            expect(typeof article.article_img_url).toBe( "string")
            expect(typeof article.comment_count).toBe('number')
            expect(body.articles).toBeSortedBy('created_at', { descending: true })
          })
      })
  })
})

describe('/api/articles/:article_id/comments', () => {
  test('GET: 200 sends array of all comments from a single article to the client', () => {
      return request(app)
      .get("/api/articles/3/comments")
      .expect(200)
      .then(({ body }) => {
        expect(body.comments.length).toBe(2);
        expect(body.comments[0]).toMatchObject({comment_id: 11,
          body: 'Ambidextrous marsupial',
          article_id: 3,
          author: 'icellusedkars',
          votes: 0,
          created_at: '2020-09-19T23:10:00.000Z'})
        expect(body.comments[1]).toMatchObject({comment_id: 10,
          body: 'git push origin master',
          article_id: 3,
          author: 'icellusedkars',
          votes: 0,
          created_at: '2020-06-20T07:24:00.000Z'})
        expect(body.comments).toBeSortedBy('created_at', { descending: true })
      
  })
})
test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
  return request(app)
    .get('/api/articles/999/comments')
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('article does not exist');
    });
});
test('GET:400 responds with an appropriate error message when given an invalid id', () => {
  return request(app)
    .get('/api/articles/not-an-id/comments')
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request');
    });
});
test('GET: 200 sends an empty array if article exists but has no comments', () => {
  return request(app)
  .get("/api/articles/13/comments")
  .expect(200)
  .then(({ body }) => {
    expect(body.comments.length).toBe(0);
    expect(body.comments).toEqual([])
  })
  
})
test('POST: 201 adds a new comment to the article which is an object', () => {
  const newComment = {
    body: 'my new comment',
    username: 'icellusedkars'}
  return request(app)
  .post("/api/articles/13/comments")
  .send(newComment)
  .expect(201)
  .then(({ body }) => {
    expect(body.comment).toMatchObject({body: 'my new comment', 
      comment_id: expect.any(Number),
      article_id: 13,
      author: 'icellusedkars',
      votes: 0,
      created_at: expect.any(String)})

})
})
test('POST:400 responds with an appropriate status and error message when provided with incomplete data)', () => {
  const newComment = {body: 'my new comment'}
  return request(app)
    .post('/api/articles/13/comments')
    .send(newComment)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request');
    });
});
test('POST:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
  const newComment = {
    body: 'my new comment',
    username: 'icellusedkars'}
  return request(app)
    .post('/api/articles/999/comments')
    .send(newComment)
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('article does not exist');
    });
})
test('POST:400 responds with an appropriate status and error message when provided with incorrect username)', () => {
  const newComment = {body: 'my new comment', username: 'ryadav'}
  return request(app)
    .post('/api/articles/13/comments')
    .send(newComment)
    .expect(400)
    .then((response) => {
      expect(response.body.msg).toBe('Bad request');
    });
  })
  test('POST:400 sends an appropriate status and error message when given an invalid endpoint', () => {
    const newComment = {
      body: 'my new comment',
      username: 'icellusedkars'}
    return request(app)
      .post('/api/articles/not-an-id/comments')
      .send(newComment)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request');
      });
    })
});

describe('/api/comments/:comment_id', () => {
  test('DELETE: 204 deletes specific comment and sends no content back', () => {
    return request(app).delete('/api/comments/3').expect(204)
  })
  test('DELETE:404 responds with an appropriate status and error message when given a non-existent id', () => {
    return request(app)
      .delete('/api/comments/999')
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe('comment does not exist');
      });
  });
  test('DELETE:400 responds with an appropriate status and error message when given an invalid id', () => {
    return request(app)
      .delete('/api/comments/not-an-id')
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe('Bad request');
      })
})
})

describe('/api/users', () => {
  test('GET: 200 sends an array of objects of all the users', () => {
    return request(app)
    .get('/api/users')
    .expect(200)
    .then(({ body }) => {
      expect(body.users.length).toBe(4)
      expect(body.users[0]).toMatchObject({
        username: 'butter_bridge',
        name: 'jonny',
        avatar_url:
          'https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg'
      })
      expect(body.users[1]).toMatchObject({
        username: 'icellusedkars',
        name: 'sam',
        avatar_url: 'https://avatars2.githubusercontent.com/u/24604688?s=460&v=4'
      })
      expect(body.users[2]).toMatchObject({
        username: 'rogersop',
        name: 'paul',
        avatar_url: 'https://avatars2.githubusercontent.com/u/24394918?s=400&v=4'
      })
      expect(body.users[3]).toMatchObject({
        username: 'lurker',
        name: 'do_nothing',
        avatar_url:
          'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png'
      })
    })
  })
  test('GET: 404 status code and error message when given wrongly spelt endpoint or invalid endpoint', () => {
    return request(app)
    .get('/api/usrs')
    .expect(404)
    .then((response) => {
    expect(response.body.msg).toBe('path not found');
      });
    
})
})

describe('/api/articles/?=:topic)', () => {
  test('GET 200: returns with articles by certain topic', () => {
    return request(app)
    .get("/api/articles?topic=mitch")
    .expect(200)
    .then(({ body }) => {
      expect(body.articles.length).toBe(12)
          body.articles.forEach((article) => {
            expect(typeof article.author).toBe("string")
            expect(typeof article.article_id).toBe('number')
            expect(typeof article.title).toBe("string")
            expect(article.topic).toBe("mitch")
            expect(typeof article.votes).toBe('number')
            expect(typeof article.created_at).toBe("string")
            expect(typeof article.article_img_url).toBe( "string")
            expect(typeof article.comment_count).toBe('number')
            expect(body.articles).toBeSortedBy('created_at', { descending: true })
          })
    })
  })
  test('GET 404: returns with error message if given wrongly spelt or invalid topic name', () => {
    return request(app)
    .get("/api/articles?topic=mitchell")
    .expect(404)
    .then((response) => {
      expect(response.body.msg).toBe('Topic not found');
    });

  })
  test('GET 200: returns with empty array if valid topic but no articles', () => {
    return request(app)
    .get("/api/articles?topic=paper")
    .expect(200)
    .then((response) => {
      console.log(response.body)
      expect(response.body.articles).toEqual([]);
    });

  })

  test('GET 200: returns all articles if query is ommitted', () => {
    return request(app)
    .get("/api/articles?=")
    .expect(200)
    .then(({ body }) => {
      expect(body.articles.length).toBe(13)
      body.articles.forEach((article) => {
        expect(typeof article.author).toBe("string")
        expect(typeof article.article_id).toBe('number')
        expect(typeof article.title).toBe("string")
        expect(typeof article.topic).toBe("string")
        expect(typeof article.votes).toBe('number')
        expect(typeof article.created_at).toBe("string")
        expect(typeof article.article_img_url).toBe( "string")
        expect(typeof article.comment_count).toBe('number')
        expect(body.articles).toBeSortedBy('created_at', { descending: true })
      })
  })

  })
})

describe('/api/articles/:article_id(comment_count)', () => {
  test('GET 200: response object now includes total number of comments for article_id', () => {
    return request(app)
        .get("/api/articles/3")
        .expect(200)
        .then((response) => {
            expect(response.body.article.article_id).toBe(3)
            expect(response.body.article.author).toBe("icellusedkars")
            expect(response.body.article.title).toBe("Eight pug gifs that remind me of mitch")
            expect(response.body.article.body).toBe("some gifs")
            expect(response.body.article.topic).toBe("mitch")
            expect(response.body.article.votes).toBe(0)
            expect(response.body.article.created_at).toBe("2020-11-03T09:12:00.000Z")
            expect(response.body.article.article_img_url).toBe( "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700")
            expect(response.body.article.comment_count).toBe(21)
        })
  })
  test('GET 200: Comment count has default value of 0 if no comments', () => {
    return request(app)
    .get("/api/articles/13")
    .expect(200)
    .then((response) => {
      expect(response.body.article.article_id).toBe(13)
      expect(response.body.article.comment_count).toBe(0)
  })
  })
})