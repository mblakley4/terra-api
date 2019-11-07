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

  describe('POST /api/pledges', () => {

    it(`creates a pledge, responding with 201 and the new pledge`, () => {
      const newPledge = {
        name: 'Test Name',
        location: 'Test Location',
        days: 99
      }
      return supertest(app)
        .post('/api/pledges')
        .send(newPledge)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newPledge.name)
          expect(res.body.location).to.eql(newPledge.location)
          expect(res.body.days).to.eql(newPledge.days)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/pledges/${res.body.id}`)
        })
        .then(res =>
          supertest(app)
            .get(`/api/pledges/${res.body.id}`)
            .expect(res.body)
        )
    })

    const requiredFields = ['name', 'location', 'days']

    requiredFields.forEach(field => {
      const newPledge = {
        name: 'Test Name',
        location: 'Test Location',
        days: 99
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newPledge[field]

        return supertest(app)
          .post('/api/pledges')
          .send(newPledge)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

    it('removes XSS attack content from response', () => {
      const { maliciousPledge, expectedPledge } = makeMaliciousPledge()
      return supertest(app)
        .post(`/api/pledges`)
        .send(maliciousPledge)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(expectedPledge.name)
          expect(res.body.location).to.eql(expectedPledge.location)
        })
    })

  })

  describe(`GET /api/pledges/:pledge_id`, () => {
    context(`Given no pledges`, () => {
      it(`responds with 404`, () => {
        const pledgeId = 123456
        return supertest(app)
          .get(`/api/pledges/${pledgeId}`)
          .expect(404, { error: { message: `Pledge doesn't exist` } })
      })
    })

    context('Given there are pledges in the database', () => {
      const testPledges = makePledgesArray()

      beforeEach('insert pledges', () => {
        return db
          .into('terra_pledges')
          .insert(testPledges)
      })

      it('responds with 200 and the specified pledge', () => {
        const pledgeId = 2
        const expectedPledge = testPledges[pledgeId - 1]
        return supertest(app)
          .get(`/api/pledges/${pledgeId}`)
          .expect(200, expectedPledge)
      })
    })

    context(`Given an XSS attack pledge`, () => {
      const testPledges = makePledgesArray();
      const { maliciousPledge, expectedPledge } = makeMaliciousPledge()

      beforeEach('insert malicious pledge', () => {
        return db
          .into('terra_pledges')
          .insert([ maliciousPledge ])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/pledges/${maliciousPledge.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql(expectedPledge.name)
            expect(res.body.location).to.eql(expectedPledge.location)
          })
      })
    })
  })

  describe(`PATCH /api/pledges/:pledge_id`, () => {
    context(`Given no pledges`, () => {
      it(`responds with 404`, () => {
        const pledgeId = 123456
        return supertest(app)
          .get(`/api/pledges/${pledgeId}`)
          .expect(404, { error: { message: `Pledge doesn't exist` } })
      })
    })

    context('Given there are pledges in the database', () => {
      const testPledges = makePledgesArray()

      beforeEach('insert pledges', () => {
        return db
          .into('terra_pledges')
          .insert(testPledges)
      })

      it('responds with 204 and updates the pledge', () => {
        const idToUpdate = 2
        const updatePledge = {
          likes: 4
        }

        const expectedPledge = {
          ...testPledges[idToUpdate - 1],
          ...updatePledge
        }

        return supertest(app)
          .patch(`/api/pledges/${idToUpdate}`)
          .send(updatePledge)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/pledges/${idToUpdate}`)
              .expect(expectedPledge)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/pledges/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain 'likes'`
            }
          })
      })
    })

  })
})
