'use strict'

const express = require('express')
const encuestaCtrl = require('../controller/encuesta')
const api = express.Router()


api.get('/', encuestaCtrl.getTest)
api.get('/genc', encuestaCtrl.getAnswers)
api.post('/penc', encuestaCtrl.postAnswers)

api.get('/pubK', encuestaCtrl.getPublicKey)
api.post('/submit', encuestaCtrl.submitPoll)

// Shamir Secret Sharing
api.get('/getSlices', encuestaCtrl.getSlices)
api.get('/decrypt', encuestaCtrl.recoverPollFromClient)

module.exports = api

