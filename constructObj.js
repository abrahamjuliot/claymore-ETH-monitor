// process helpers
const time = (totalMinutes) => {
  const 
  totalHours = Math.floor(totalMinutes/60),
  minutes = totalMinutes%60,
  days = Math.floor(totalHours/24),
  hours = totalHours%24
  return `${days}d ${hours}:${minutes<10? `0${minutes}`: minutes}`
}
const split = (x) => x.split(';')
const evenIndexes = (x) => x.filter((value, index) => (index%2))
const oddIndexes = (x) => x.filter((value, index) => !(index%2))

// process data and construct object
const processData = (name, res) => {
  const data = {}
    data.name = name
    data.version = res[0]
    data.minutes = res[1] 
    data.stats = split(res[2])
    data.gpus = split(res[3])
    data.cooling = split(res[6])
    data.pool = res[7]
    data.gpuShares = split(res[9])
    data.uptime = time(data.minutes)
    data.hashrate = data.stats[0]/1000
    data.shares = data.stats[1]
    data.rejected = data.stats[2]
    data.temps = oddIndexes(data.cooling)
    data.averageTemp = Math.floor(
      data.temps.reduce((total, num) => +total + +num) / data.temps.length
    )
    data.fans = evenIndexes(data.cooling)
  return data
}

module.exports = processData