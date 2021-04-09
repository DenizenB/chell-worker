// https://developers.cloudflare.com/workers/examples/cache-using-fetch

const CACHE_TTL = 3600
const PATHS = {
  'urlhaus/online.csv': "https://urlhaus.abuse.ch/downloads/csv_online/",
  'urlhaus/payloads.csv.zip': "https://urlhaus.abuse.ch/downloads/payloads/",
  'feodotracker.csv': "https://feodotracker.abuse.ch/downloads/ipblocklist.csv",
  'feodotracker/aggressive.csv': "https://feodotracker.abuse.ch/downloads/ipblocklist_aggressive.csv",
  'threatfox/all.csv.zip': "https://threatfox.abuse.ch/export/csv/full/",
  'malwarebazaar/all.csv.zip': "https://bazaar.abuse.ch/export/csv/full/",
  'malwarebazaar/sha256.csv.zip': "https://bazaar.abuse.ch/export/txt/sha256/full/",
  'malwarebazaar/md5.csv.zip': "https://bazaar.abuse.ch/export/txt/md5/full/",
  'sslbl/cert.csv': "https://sslbl.abuse.ch/blacklist/sslblacklist.csv",
  'sslbl/ja3.csv': "https://sslbl.abuse.ch/blacklist/ja3_fingerprints.csv",
  'sslbl/ip.csv': "https://sslbl.abuse.ch/blacklist/sslipblacklist.csv",
}

async function handleRequest(request) {
  let url = new URL(request.url)
  const path = url.pathname.substr(1)

  if (path in PATHS) {
    // Proxy request to abuse.ch
    const resource = PATHS[path]
    const response = await fetch(resource, {
      cf: {
        cacheTtl: CACHE_TTL,
        cacheEverything: true
      }
    })

    return response
  }

  if (!path) {
    // List endpoints
    let banner = `<h1>abuse.ch exports</h1>
    <p>served by Cloudflare worker, 1 hour cache</p>
    <ul>`
    for (item in PATHS) {
      banner += '<li><a href="/' + item + '">' + item + '</a></li>'
    }
    banner += '</ul>'

    return new Response(banner, {
      status: 200,
      headers: {
        'Content-Type': 'text/html'
      }
    })
  }
  
  return new Response('no', {status: 404})
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})