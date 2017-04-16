# night-route

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Node.js Version][node-version-image]][node-version-url]

fast routing without regexp

## using with koa

```js
const { Router } = require('night-route/koa')

let router = new Router()
router.get('/size/:width/:height', ctx => {
    ctx.body = ctx.params.width * ctx.params.height
})

app.use(router.routes())
```

### in batch

```js
router.route('/posts', {
  get (ctx) {}
  post (ctx) {}
})

router.route('/posts/:id', middleware, middleware2, {
  get (ctx) {},
  put (ctx) {},
  delete (ctx) {}
})
```

### shorthands

```js
const { GET } = require('night-route/koa')

app.use(GET('/', ctx => {
  ctx.body = "index"
}))
```

### more http methods

```js
router.route('TRACE', ctx => {})
```

[npm-image]: https://img.shields.io/npm/v/night-route.svg?style=flat
[npm-url]: https://npmjs.org/package/night-route
[travis-image]: https://img.shields.io/travis/zweifisch/night-route.svg?style=flat
[travis-url]: https://travis-ci.org/zweifisch/night-route
[node-version-image]: https://img.shields.io/node/v/night-route.svg
[node-version-url]: https://nodejs.org/en/download/
