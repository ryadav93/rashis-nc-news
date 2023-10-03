const db = require("../db/connection.js");
const app = require("../db/app.js");
const request = require("supertest");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");
const endpoints = require('../endpoints.json')

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