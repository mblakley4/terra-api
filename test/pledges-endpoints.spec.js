const knex = require('knex')
const app = require('../src/app')
const { makePledgesArray, makeMaliciousPledge } = require('./pledges.fixtures')

describe('Pledges Endpoints', function() {
  let db

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)

  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE terra_pledges RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE terra_pledges RESTART IDENTITY CASCADE'))

  describe('GET /api/pledges', () => {
    context('Given no pledges', () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
        .get('/api/pledges')
        .expect(200, [])
      })
    })
  })

  context('Given there are pledges in the database', () => {
    const testPledges = makePledgesArray();

    beforeEach('insert pledges', () => {
      return db
        .into('terra_pledges')
        .insert(testPledges)
    })

    it('responds with 200 and all of the pledges', () => {
      return supertest(app)
        .get('/api/pledges')
        .expect(200, testPledges)
    })
  })

  context('Given an XSS attack pledge',  () => {
    const { maliciousPledge, expectedPledge } = makeMaliciousPledge()

    beforeEach('insert malicious pledge', () => {
      return db
        .into('terra_pledges')
        .insert([ maliciousPledge ])
    })

    it('removes XSS attack content', () => {
      return supertest(app)
        .get('/api/pledges')
        .expect(200)
        .expect(res => {
          expect(res.body[0].name).to.eql(expectedPledge.name)
          expect(res.body[0].location).to.eql(expectedPledge.location)
        })
    })
  })

})
