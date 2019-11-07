const express = require('express')
const xss = require('xss')
const path = require('path')
const PledgesService = require('./pledges-service')

const pledgesRouter = express.Router()
const jsonParser = express.json()

const serializePledge = pledge => ({
  id: pledge.id,
  name: xss(pledge.name),
  location: xss(pledge.location),
  days: pledge.days,
  likes: pledge.likes,
})

pledgesRouter
  .route('/')
  .get((req, res, next) => {
    PledgesService.getAllPledges(
      req.app.get('db')
    )
    .then(pledges => {
      res.json(pledges.map(serializePledge))
    })
    .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name, location, days } = req.body
    const newPledge = { name, location, days }

    for (const [key, value] of Object.entries(newPledge)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    PledgesService.insertPledge(
      req.app.get('db'),
      newPledge
    )
    .then(pledge => {
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${pledge.id}`))
        .json(serializePledge(pledge))
    })
    .catch(next)
  })

pledgesRouter
  .route('/:pledge_id')
  .all((req, res, next) => {
    PledgesService.getById(
      req.app.get('db'),
      req.params.pledge_id
    )
    .then(pledge => {
      if (!pledge) {
        return res.status(404).json({
          error: { message: `Pledge doesn't exist` }
        })
      }
      res.pledge = pledge
      next()
    })
    .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializePledge(res.pledge))
  })
  .patch(jsonParser, (req, res, next) => {
    const { likes } = req.body
    const pledgeToUpdate = { likes }

    const numberOfValues = Object.values(pledgeToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain 'likes'`
        }
      })
    }

    PledgesService.updatePledge(
      req.app.get('db'),
      req.params.pledge_id,
      pledgeToUpdate
    )
    .then(numRowsAffected => {
      res.status(204).end()
    })
    .catch(next)
  })

module.exports = pledgesRouter
