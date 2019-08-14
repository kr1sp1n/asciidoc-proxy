const http = require('http');
const https = require('https');
const URL = require('url');
const querystring = require('querystring');
const asciidoctor = require('asciidoctor')()
const fs = require('fs')

const hostname = '127.0.0.1';
const port = process.env.PORT || 3000;
const styles = fs.readFileSync('./styles.css').toString()

const handleRequest = (req, res) => {
  const { query, pathname } = URL.parse(req.url)
  const { url } = querystring.parse(query)
  if (pathname === '/styles.css') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/css');
    res.end(styles);
    return
  }
  if (!url) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Please pass /?url=<url-to-asciidoc>.\n');
    return
  }
  const request = https.get(url, (response) => {
    let body = ""
    response.on('data', (d) => {
      body += d
    });
    response.on('close', () => {
      res.end(asciidoctor.convert(body, {
        header_footer: true,
        safe: 'safe',
        attributes: {
          linkcss: true,
          stylesheet: 'styles.css',
          stylesdir: '/',
        }
      }))
    })
  })
  request.on('error', (e) => {
    console.error(e);
  });
}

const server = http.createServer(handleRequest);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
