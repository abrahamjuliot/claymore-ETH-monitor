const connectMiner = require('./connectMiner.js')

connectMiner({name: 'garage', ip: process.env.MINER_IP, port: process.env.MINER_PORT})

// server
const express = require('express')
const app = express()
app
  .use(express.static('public'))
  .get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
  })
  .listen(3000, () => console.log('server started'))