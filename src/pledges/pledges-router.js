const express = require('express')
const xss = require('xss')
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


module.exports = pledgesRouter
