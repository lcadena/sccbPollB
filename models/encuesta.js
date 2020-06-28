'use strict'

//importar mongoose
const mongoose = require('mongoose')
//esquema de mongoose
const Schema = mongoose.Schema

//crea los campos del esquema del producto
const EncuestaSchema = Schema({
  answerQ1: String,
  answerQ2: String,
  answerQ3: String,
//   //relaciona una tienda y el listado de productos que dispone 
//   products: [{ type: Schema.Types.ObjectId, ref: "Product"}]
})

module.exports = mongoose.model('Encuesta', EncuestaSchema)