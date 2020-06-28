const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const api_enc = require('./routes/routes')
const router = express.Router();

/* Configuration */
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json())
app.use(router)
// app.use(cors({origin: 'http://localhost:4300'}, {origin: 'http://localhost:3800'}))
// app.options('*',cors())
// Cabecera cors mas restictiva
app.use((req, res, next) => {
    //res.header("Access-Control-Allow-Origin","http://localhost:8100", "https://www.facebook.com");
    res.header("Access-Control-Allow-Origin","http://localhost:4200", "http://localhost:3800", "http://localhost:3000");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    }
    next()
})
app.use(cors())
app.use(express.json())
app.use('', api_enc)
/** Listen on por 3000 and run server **/
app.listen(3000, () => {
    console.log("Node server running on http://localhost:3000");
});

module.exports = app;