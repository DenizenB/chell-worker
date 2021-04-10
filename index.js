// https://developers.cloudflare.com/workers/examples/cache-using-fetch

const CACHE_TTL = 3600
const CF_OPTS = {
  cacheTtl: CACHE_TTL,
  cacheEverything: true
}

const BLACKLISTS = {
  'urlhaus/all.csv.zip': "https://urlhaus.abuse.ch/downloads/csv/",
  'urlhaus/30days.csv': "https://urlhaus.abuse.ch/downloads/csv_recent/",
  'urlhaus/online.csv': "https://urlhaus.abuse.ch/downloads/csv_online/",
  'urlhaus/payloads.csv.zip': "https://urlhaus.abuse.ch/downloads/payloads/",
  'feodotracker/all.csv': "https://feodotracker.abuse.ch/downloads/ipblocklist_aggressive.csv",
  'feodotracker/30days.csv': "https://feodotracker.abuse.ch/downloads/ipblocklist.csv",
  'threatfox/all.csv.zip': "https://threatfox.abuse.ch/export/csv/full/",
  'threatfox/48hours.csv': "https://threatfox.abuse.ch/export/csv/recent/",
  'malwarebazaar/all.csv.zip': "https://bazaar.abuse.ch/export/csv/full/",
  'malwarebazaar/sha256.csv.zip': "https://bazaar.abuse.ch/export/txt/sha256/full/",
  'malwarebazaar/md5.csv.zip': "https://bazaar.abuse.ch/export/txt/md5/full/",
  'sslbl/cert.csv': "https://sslbl.abuse.ch/blacklist/sslblacklist.csv",
  'sslbl/ja3.csv': "https://sslbl.abuse.ch/blacklist/ja3_fingerprints.csv",
  'sslbl/ip.csv': "https://sslbl.abuse.ch/blacklist/sslipblacklist.csv",
}

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname.substr(1)
  let match

  if (path in BLACKLISTS) {
    // Proxy request to abuse.ch blacklist
    return fetch(BLACKLISTS[path], {cf: CF_OPTS})
  }

  if (match = path.match(/urlhaus\/url\/(\d+)/)) {
    // Fetch url details (in HTML because the API is throwing a fit)
    const resource = "https://urlhaus.abuse.ch/url/" + match[1]
    const response = await fetch(resource, {cf: CF_OPTS})
    const body = await response.text()

    // Extract payload hash
    match = body.match(/<a href="\/browse\.php\?search=(.{64})/)
    if (!match) {
      return new Response(body, {status: 404})
    }

    return new Response(JSON.stringify({sha256: match[1]}), {
        headers: {
          'content-type': "application/json"
        }
      })
  }

  if (!path) {
    // List endpoints
    let banner = "<h1>abuse.ch exports</h1><p>cache TTL: 1 hour</p><ul>"
    for (item in BLACKLISTS) {
      banner += '<li><a href="/' + item + '">' + item + "</a></li>"
    }
    banner += "</ul>"

    return new Response(banner, {
      headers: {
        'Content-Type': "text/html"
      }
    })
  }
  
  return new Response("no", {status: 404})
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})