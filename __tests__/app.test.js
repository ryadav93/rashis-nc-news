const db = require("../db/connection.js");
const app = require("../db/app.js");
const request = require("supertest");
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data/index.js");

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