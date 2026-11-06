const http = require('http');

const DEFAULT_PORT = 3000;
const MIN_PORT = 1024;
const MAX_PORT = 65535;

let port;
let server;

function resolvePort(rawValue) {
  if (rawValue === undefined) {
    return DEFAULT_PORT;
  }

  // Ports below 1024 are privileged: only all-digit values inside 1024-65535 pass, so hexadecimal, signed, fractional and partly numeric strings are rejected rather than coerced.
  const isInteger = /^\d+$/.test(rawValue);
  const value = isInteger ? Number(rawValue) : Number.NaN;

  if (!isInteger || value < MIN_PORT || value > MAX_PORT) {
    console.error(`Invalid PORT value: "${rawValue}". Expected an integer between 1024 and 65535.`);
    process.exit(1);
  }

  return value;
}

function getPathname(requestUrl) {
  // The query string is dropped before matching, so /hello?x=1 both logs and routes as /hello.
  const queryIndex = requestUrl.indexOf('?');

  return queryIndex === -1 ? requestUrl : requestUrl.slice(0, queryIndex);
}

function logRequest(request, pathname) {
  console.log(`${new Date().toISOString()} ${request.method} ${pathname}`);
}

function handleHello(request, response) {
  sendText(response, 200, HELLO_BODY);
}

function handleNotFound(request, response) {
  sendText(response, 404, NOT_FOUND_BODY);
}

function sendText(response, statusCode, body) {
  response.writeHead(statusCode, { 'Content-Type': 'text/plain' });
  response.end(body);
}

const HELLO_BODY = 'Hello world';
const NOT_FOUND_BODY = 'Not Found';

const routes = [
  { method: 'GET', path: '/hello', handler: handleHello }
];

function requestListener(request, response) {
  const pathname = getPathname(request.url);
  logRequest(request, pathname);

  const route = routes.find((entry) => entry.method === request.method && entry.path === pathname);

  if (route) {
    route.handler(request, response);

    return;
  }

  handleNotFound(request, response);
}

function startServer() {
  port = resolvePort(process.env.PORT);
  server = http.createServer(requestListener);
  server.on('error', handleServerError);
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

function handleServerError(error) {
  // A failed bind arrives as an 'error' event, which would otherwise become an uncaught exception.
  if (error.code === 'EADDRINUSE') {
    console.error(`Cannot start server: port ${port} is already in use. Stop the process using that port, then retry.`);
    process.exit(1);
  }

  console.error(`Cannot start server: ${error.message}`);
  process.exit(1);
}

function handleShutdown() {
  console.log('Shutting down server...');
  process.exitCode = 0;
  server.close(() => {
    process.exit(0);
  });
}

startServer();
process.on('SIGINT', handleShutdown);
