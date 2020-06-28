'use strict'
const rsa = require('rsa')
const bc = require('bigint-conversion')
const sha = require('object-sha')
// const crypto = require('crypto')
// const paillierBigint = require('paillier-bigint')
const sss = require('shamirs-secret-sharing')
const Encuesta = require('../models/encuesta')

let keysEB; // claves de servidor de encuestas
let signatureA;
let publicKeyA;
let encriptedPoll;


function getTest(req, res) {
    res.json({msn: 'Hello World test encuesta!'});
}

function getAnswers(req, res) {
    return res.status(200).send({ message: 'Hola, encuesta recibida correctamente' });
}

function postAnswers(req, res) {
    // const encuesta = ({
    //     answerQ1: req.body.a1,
    //     answerQ2: req.body.a2,
    //     answerQ3: req.body.a3,
    // })
    console.log("Mensaje recibido desde el cliente: ", req.body.message);
    // return res.json({msn: 'Mensaje recibido!'})
    return res.status(200).send({ message: 'Hola, encuesta recibida correctamente' })
}

async function getPublicKey(req, res) {
    keysEB = rsa.rsaKeyGeneration()
    console.log('pubkey: ',keysEB['publicKey'])
    console.log('privkey: ',keysEB['privateKey'])
    return res.status(200).send(
        {e: bc.bigintToHex(keysEB['publicKey']['e']), 
         n: bc.bigintToHex(keysEB['publicKey']['n'])})
}

async function submitPoll(req, res) {
    console.log('llega del cliente al submit poll: ', req.body)
    // encuesta encriptada
    encriptedPoll = req.body.message
    console.log('encriptedPoll en servidor encuesta: ', encriptedPoll)
	// verificar que la firma sea válida
	signatureA = req.body.signature
	console.log('signatureA: ', signatureA)
	publicKeyA = new rsa.PublicKey(bc.hexToBigint(req.body.publicKey.e), bc.hexToBigint(req.body.publicKey.n))
	console.log('publicKeyA: ', publicKeyA)
	const proofDigest = bc.bigintToHex(publicKeyA.verify(bc.hexToBigint(signatureA)))
	console.log('proofDigest: ', proofDigest)
	const bodyDigest = await sha.digest(req.body.message)
    console.log('bodyDigest: ', bodyDigest)
    if (proofDigest === bodyDigest) {
        return res.status(200).send({ message: 'El submitPoll llega al server de la encuesta' })
    } else {
        return res.status(500).send({ message: 'Error en la verificación de la firma!' })
    }
	
}

/**
 * Shamir Secret Sharing
 */
let slices;
let recoveredH;

async function getSlices(req, res) {
    const secret = bc.bigintToBuf(keysEB.privateKey.d)
    console.log('secret en el servidor', secret)
    console.log('secret en el servidor en hexadecimal', bc.bufToHex(secret))
    // inicializamos la funcion de particionar la Kpriv de B
    slices = secretInit(secret)
    console.log('slices de la Kpriv del servidor', {
        slices: slices
    })
    return res.status(200).send({ message: 'Se esta completando la particion de la clave privada con shamir' })
}

//
/**
 * * @typedef {Array<string>} slices
*/
function secretInit(secret) {
    console.log('secret: ', secret)
    const buffers = sss.split(secret, {shares: 4, threshold: 2})
    console.log('buffers: ', buffers)
    
    const slices = []
    buffers.forEach(buffer => slices.push(bc.bufToHex(buffer)))
    return slices

}

function recoverPollFromClient(req, res) {
    console.log('slices en el recover: ', slices)
    console.log('encuesta encryptada: ', encriptedPoll['message'])
    // recover de clave privada combinando dos de ellas
    const recovered = sss.combine(slices.slice(2, 4))
    console.log('recovered: ', recovered)
    recoveredH = bc.bufToBigint(recovered)
    console.log('Reconstruccion de la Kpriv en Hexadecimal: ', recoveredH)
    // Instanciamos una nueva clave privada con la reconstrucción de Kpriv
    const newPrivKey = new rsa.PrivateKey(recoveredH, keysEB['publicKey'])
    console.log('Nueva Kpriv de B: ', newPrivKey)
    let poll = newPrivKey.decrypt(bc.hexToBigint(encriptedPoll['message']))
    console.log("Encuesta desencriptada con shamir: ", poll);
    return res.status(200).send({ message: bc.bigintToHex(poll) })

}

module.exports = {
    getTest,
    getAnswers,
    postAnswers,
    getSlices,
    getPublicKey,
    submitPoll,
    recoverPollFromClient
}