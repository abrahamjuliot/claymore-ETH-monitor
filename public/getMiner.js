// notify
const notify = ({t, tLimit, h, hLimit}) => {
  let notification
  if (Notification.permission === 'granted') {
    if (h < hLimit || t > tLimit) {
      notification = new Notification(
        'Claymore', { body: `${h} Mh/s ${t}C°`, icon: 'eth.png' }
      )
      setTimeout(notification.close.bind(notification), 7000)
    }
  }
}

// helpers
const ready = (fn) => {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading") {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}
const when = (url, fn) => {
  const req = new XMLHttpRequest()
  req.open('GET', url, true)
  req.onload = () => {
    if (req.status >= 200 && req.status < 400) {
      fn(JSON.parse(req.responseText))
    }
  }
  req.send()
}
const id = (name) => document.getElementById(name)
const query = (name) => document.querySelector(name)
const patch = (oldEl, newEl) => oldEl.parentNode.replaceChild(newEl, oldEl)
const append = (parent, child) => parent.appendChild(child)
const fragment = (str) => {
  const temp = document.createElement('template')
  temp.innerHTML = str
  return temp.content
}
const html = (strings,...values) => {
	const clean = str => str.replace(/[\r\n\t]/g, '')
	const str = clean(strings.map((string, i) => 
		`${string} ${values[i] || ''}`).join(''))
	return fragment(str)
}
const repeat = (list, fn) => list.map(item => fn(item)).join('')
const render = (data, fn) => fn(data)

// object interfaces to compose
const cssStyleInjector = (css) => ({
	// object has css style()
	style: () => `<style>${css}</style>` 
})
const elementEntryPoint = (name) => ({
	// object has element entry point
	el: () => id(name) 
})
const componentCollection = (obj) => {
	// object has collection of components
	let newObj = {}
	for (const key in obj) {
		Object.assign(newObj, { [key]: () => obj[key] } )
	}
	return newObj
}

// factory
const scene = (api) => {
	// private
	const el = 'app'
	let data = {
    name: api.name,
    version: api.version,
    uptime: api.uptime,
    pool: api.pool,
    stats: {
      hashrate: api.hashrate.toFixed(2),
      shares: api.shares,
      rejected: api.rejected,
      temp: api.averageTemp
    },
    gpuSet: [],
		title: `Miner`,
    credits: `Created by <a href="https://github.com/abrahamjuliot" target="_blank">abrahamjuliot</a>`
	}
  
  api.gpus.forEach((key, i) => data.gpuSet[i] = {
  	number: i,
    hashrate: (api.gpus[i]/1000).toFixed(2), 
    shares: api.gpuShares[i],
    temp: api.temps[i],
    fan: api.fans[i]
  })
  
	const css = `
  @import url('https://fonts.googleapis.com/css?family=Roboto+Mono:400,700');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css');
  body {padding: 10px}
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    border: 1px solid #eee;
    margin: 10px;
  }
  .card *, footer, h1 {
    font-family: 'Roboto Mono', monospace;
    box-sizing: border-box;
  }
  .miner {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid #eee;
    width: 100%;
  }
  .miner * {
    padding: 5px 10px;
  }
  .name {
    font-weight: 700;
    text-transform: capitalize;
  }
  .stats {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .gpus {
    padding: 7px 10px;
    display: flex;
    flex-direction: column;
  }
  .gpu {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    width: 100%;
  }
  @media (min-width: 48rem) {
    .gpu {
      flex-direction: row;
    }
  }
  .gpu {
    font-weight: 700;
    padding: 10px 15px;
  }
  .gpu * {
    font-weight: normal;
    padding: 0 15px;
  }
  .miner *,
  .gpus * {
    width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .share-found {
    min-height: 45px;
    padding: 15px 25px 0;
    font-weight: 700;
    color: rgba(133, 216, 175, 1);
    transition: height .3s ease;
  }
  @media (min-width: 48rem) {
    .stats {
      flex-direction: row;
    }
  }
  @keyframes score {
    0% {
      transform: translateY(-10px);
      opacity: 0;  
    }
    30%, 90% {
      transform: translateY(0);
      opacity: 1;  
    }
    100% {
      transform: translateX(10px);
      opacity: 0;  
    }
  }
  @keyframes change {
    0%, 70% {
      background: rgba(133, 216, 175, 0.3);
      box-shadow: 0 0 0 0 rgba(133, 216, 175, 0.3);
    }
  }
  `
	const template = ({ style, ...view }) =>
		html`
			${style()}
			${view.header()}
			<div id='app'>
        <article class="card">
          <header class="miner"> 
            <div class="name">${data.name}</div>
            <div class="version">${data.version}</div>
            <div class="uptime">${data.uptime}</div>
            <div class="pool">${data.pool}</div>
            <div class="stats">
              <div class="total-hashrate">${data.stats.hashrate}</div>
              <div class="total-shares">${data.stats.shares}</div>
              <div class="total-rejected">${data.stats.rejected}</div>
              <div class="average-temp">${data.stats.temp}°</div>
            </div>
          </header>
          <section class="share-found"></section>
          <section class="gpus">
          	${repeat(data.gpuSet, (gpu) => `
              <div class="gpu" GPU${gpu.number}>GPU${gpu.number}
                <div class="hashrate" GPU${gpu.number}>${gpu.hashrate}</div>
                <div class="shares" GPU${gpu.number}>${gpu.shares}</div>
                <div class="temp" GPU${gpu.number}>${gpu.temp}°</div>
                <div class="fan" GPU${gpu.number}>${gpu.fan}%</div>
            	</div>
              `
             )} 
          </section>
        </article>      
			</div>
			${view.footer()}`	
	const components = {
		header: `<h1>${data.title}</h1>`,
		footer: `<footer>${data.credits}</footer>`
	}
			
	// public
	return Object.assign({
  		uptime: () => data.uptime,
      stats: () => data.stats,
			gpuSet: () => data.gpuSet,
			template: () => template
		},
		elementEntryPoint(el),
		componentCollection(components),
		cssStyleInjector(css)
	)
}

// set up initial scene
const url = 'api.json'
const timeout = 1000
const highTemperatureNotify = 60
const lowHashrateNotify = 222.9
const change = `style="animation: change .7s ease both"`
const score = `style="animation: score 3s ease both"`
const shareFound = (gpuNumber) => {
  const date = new Date();
  const timeStamp = date.toLocaleString()
  patch(query('.share-found'), 
    html`<section class="share-found" ${score}>${timeStamp} - SHARE FOUND - GPU ${gpuNumber}</section>`
  )
}
let newTitle = ''

ready(() => {
  when(url, (api) => {
    const app = scene(api)
    
    patch(
      app.el(), render(app, app.template())
    )

    // update dom
    setInterval(() => {
      when(url, (data) => {
        const socket = scene(data)

        // update title
        const {hashrate, shares, rejected, temp} = socket.stats()
        newTitle = `${hashrate} Mh/s ${temp}C°`
        if (document.title != newTitle) {
          document.title = newTitle
        }

        // set notification and notify limits exceeded
        Notification.requestPermission(notify({
          t: temp, 
          tLimit: highTemperatureNotify, 
          h: hashrate, 
          hLimit: lowHashrateNotify
        }))

        // patch dom with new data if it changed
        const patchStats = (selector, newData) => 
          query(`.${selector}`).textContent.trim() != newData && patch(query(`.${selector}`), 
            html`<div class=${selector}>${selector!='average-temp'? newData: newData+'°'}</div>`
          )
        patchStats('uptime', socket.uptime())
        patchStats('total-hashrate', hashrate)
        patchStats('total-shares', shares)
        patchStats('total-rejected', rejected)
        patchStats('average-temp', temp)


        // calc percent of shares per gpu
        const percentShares = [], gpuShares = [], percentTemps = [], gpuTemps = []
        const gpuSet = socket.gpuSet()
        for (const x of gpuSet) {
          gpuTemps.push(x.temp)
          gpuShares.push(x.shares)
        }
        const maxShares = Math.max(...gpuShares)
        const maxTemp = Math.max(...gpuTemps)
        for (const x of gpuShares) {
          percentShares.push(((x/maxShares)*100).toFixed(0))
        }
        for (const x of gpuTemps) {
          percentTemps.push(((x/maxTemp)*100).toFixed(0))
        }
        const 
          blue = '#a2bcec',
          green = '#a2ecc4', 
          orange = '#ffecdb', 
          red = '#eca2a2'
        // patch gpu sets
        patch(query('.gpus'), 
          html`
          <section class="gpus">
            ${repeat(socket.gpuSet(), (gpu) => `
              <div class="gpu" GPU${gpu.number}>GPU${gpu.number}
              <div class="hashrate" GPU${gpu.number} ${
                +(query(`.hashrate[GPU${gpu.number}]`).textContent.trim()) != gpu.hashrate? change: `style=""`
              }>${gpu.hashrate}</div>
              <div style=${`"background: linear-gradient(90deg, #eee ${percentShares[gpu.number]}%, #fff ${percentShares[gpu.number]}%)"}`} class="shares" GPU${gpu.number} ${
                +(query(`.shares[GPU${gpu.number}]`).textContent.trim()) < gpu.shares && shareFound(gpu.number)
              }>${gpu.shares}</div>
              <div style=${`"background: linear-gradient(90deg, ${gpu.temp<55?blue:gpu.temp<60?green:gpu.temp<75?orange:red} ${percentTemps[gpu.number]}%, #fff ${percentTemps[gpu.number]}%)"}`} class="temp" GPU${gpu.number}>${gpu.temp}°</div>
              <div class="fan" GPU${gpu.number}>${gpu.fan}%</div>
              </div>
              `
            )}
          </section>
          `
        )    
      })
    }, timeout)
  })
})