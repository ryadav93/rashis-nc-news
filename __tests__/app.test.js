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
      console.log(response)
      expect(response.body.msg).toBe('Bad request');
    });
});
});
test('GET: 200 sends an empty array if article exists but has no comments', () => {
  return request(app)
  .get("/api/articles/13/comments")
  .expect(200)
  .then(({ body }) => {
    console.log(body)
    expect(body.comments.length).toBe(0);
    expect(body.comments).toEqual([])
  })
})
