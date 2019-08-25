const constructObj = require('./constructObj.js')
const net = require('net')
const fs = require('fs')
const req = `{
  "id": 0,
  "jsonrpc": "2.0",
  "method": "miner_getstat2"
}`
const log = (err) => err ? console.log(err): undefined
const write = (x, data) =>
  fs.writeFile(x, JSON.stringify(data), 'utf8', log)

const connectMiner = ({name, ip, port}) => {
  let api = {}
  const socket = new net.Socket()

  const connect = () => {
    setTimeout(() => socket.connect(port, ip), 1000)
  }

  socket
    .on('connect', () => {
      socket.write(req, 'utf8', connect())
    })
    .on('data', data => {
      api = constructObj(name, JSON.parse(data).result)
      write(`${__dirname}/public/api.json`, api)
      socket.end()
    })
    .on('error', error => {
      console.error('An error occurred: ', error)
    })

  connect()
}

module.exports = connectMiner