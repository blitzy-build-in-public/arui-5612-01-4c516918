# nodejs-tutorial-hello-world

## Purpose

A minimal Node.js HTTP server that demonstrates a single endpoint and request handling with no
framework at all — nothing but the `http` module that ships with Node.js. It is written for
beginners who want to see how an HTTP server works before reaching for a framework. The server
answers exactly two requests: `GET /hello` returns a greeting, and every other method and path
combination returns a `404` catch-all.

## Prerequisites

Node.js v18.0.0 or newer. Check the version you have:

```
node --version
```

The command prints something like `v22.23.4`. Any version at or above `v18.0.0` runs the server.

## Installation

None is required beyond having Node.js. The project has no dependencies: no `dependencies` and no
`devDependencies` in `package.json`, nothing to install, no lock file and no build step. The source
file is the program, and it runs as it is.

## Execution

Start the server:

```
node server.js
```

`npm start` runs exactly the same command:

```
npm start
```

Both print this line on standard output:

```
Server listening on port 3000
```

The process then stays in the foreground, listening for requests. Press CTRL+C to stop it (see
Shutdown below).

## Testing

Leave the server running and open a second terminal. Send a request to the one route:

```
curl http://localhost:3000/hello
```

The response body is:

```
Hello world
```

Add `-i` to see the status line and the headers as well:

```
curl -i http://localhost:3000/hello
```

```
HTTP/1.1 200 OK
Content-Type: text/plain
Date: Fri, 30 Oct 2026 06:42:48 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

Hello world
```

Request a path that has no route:

```
curl -i http://localhost:3000/invalid
```

```
HTTP/1.1 404 Not Found
Content-Type: text/plain
Date: Fri, 30 Oct 2026 06:42:48 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

Not Found
```

Request the route with a different method:

```
curl -i -X POST http://localhost:3000/hello
```

```
HTTP/1.1 404 Not Found
Content-Type: text/plain
Date: Fri, 30 Oct 2026 06:42:48 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

Not Found
```

The `Date` line holds the current time, so its value is different on every response; every other
line above is produced exactly as shown.

The matching rule is one sentence long: a request reaches the hello handler only when its method is
exactly `GET` and its path is exactly `/hello`. Everything from a `?` onwards is stripped before
matching, so this request also returns `Hello world`:

```
curl http://localhost:3000/hello?x=1
```

Every other method and path combination falls through to the `404` catch-all. Matching is exact and
case-sensitive, so `GET /Hello` and `GET /hello/` both return `Not Found`.

## Expected output

Starting the server prints the startup line, which always carries the port the server actually bound:

```
Server listening on port 3000
```

Every incoming request prints one log line, before the request is routed, in the format
`[ISO-8601 timestamp] [HTTP method] [request path]`:

```
2026-10-30T06:42:48.123Z GET /hello
```

The timestamp is UTC in ISO-8601 form with millisecond precision, and the fields are separated by
single spaces. The path logged for `GET /hello?x=1` is `/hello`, because the query string is not part
of the path.

A request that matches the route answers with this body and status `200`:

```
Hello world
```

A request that matches nothing answers with this body and status `404`:

```
Not Found
```

Both bodies are plain text, sent with `Content-Type: text/plain`, and neither carries a trailing
newline: `Hello world` is 11 bytes and `Not Found` is 9 bytes. These are the only two response
bodies the program can produce — no internal error message is ever sent to a client, because every
diagnostic goes to the console instead.

Stopping the server prints:

```
Shutting down server...
```

## Shutdown

Press CTRL+C in the terminal that is running the server. It prints:

```
Shutting down server...
```

then stops accepting connections and the process exits with status code `0` — not the `130` a shell
reports for a process that is simply killed by CTRL+C. Once it has exited, the port is released, so a
`curl` command issued afterwards fails to connect rather than being answered.

## PORT configuration

The listening port comes from the `PORT` environment variable. It defaults to `3000` when the
variable is not set, and it must be an integer from `1024` to `65535`. Set it on the same line as the
command to listen somewhere else:

```
PORT=4000 node server.js
```

```
Server listening on port 4000
```

The override applies to the whole server, including every example request, so the same check moves to
the port you chose:

```
curl http://localhost:4000/hello
```

```
Hello world
```

A value that is not all digits, or that falls outside `1024`-`65535`, is rejected before anything is
bound: the process writes the offending value to standard error, prints no startup line, and exits
with status code `1`. For example:

```
PORT=abc node server.js
```

```
Invalid PORT value: "abc". Expected an integer between 1024 and 65535.
```

`3000abc`, `3000.5`, an empty `PORT=`, and out-of-range values such as `80`, `1023` and `65536` are
rejected in exactly the same way. Because everything below `1024` is refused, the server never binds
a privileged port, and there is no option that lets it.

If the port is already taken by another process, the new process says so and exits with status code
`1`, while the process that already holds the port keeps serving:

```
PORT=3000 node server.js
```

```
Cannot start server: port 3000 is already in use. Stop the process using that port, then retry.
```

Any other failure to bind prints `Cannot start server: ` followed by the runtime's own error message
and exits with status code `1` as well. To sum up the two exit codes: `0` after a clean CTRL+C
shutdown, `1` after a configuration or bind failure.
