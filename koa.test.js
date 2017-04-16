const Koa = require('koa')
const fetch = require('node-fetch')
const { Router, route, GET, POST } = require('./koa')

const run = app => {
    let server = app.listen(0)
    let { port } = server.address()
    return {
        url: `http://127.0.0.1:${port}`,
        close () { server.close() }
    }
}

const request = (server, path, opts) => fetch(`${server.url}${path}`, opts)

const id2int = async (ctx, next) => {
    if (ctx.params && ctx.params.id) {
        ctx.params.id = +ctx.params.id
    }
    await next()
}


test('routing', async () => {

    let app = new Koa()
    let router = new Router()

    router.get('/', ctx => {
        ctx.body = 'root'
    }).get('/path', ctx => {
        ctx.body = 'path'
    }).get('/params/:id', ctx => {
        ctx.body = ctx.params
    }).get('/:catch', ctx => {
        ctx.body = ctx.params
    }).put('/:catch', ctx => {
        ctx.body = { params: ctx.params, method: 'put' }
    })
    app.use(router.routes())

    let server = run(app)

    let res = await request(server, '/')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('root')

    res = await request(server, '/path')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('path')

    res = await request(server, '/params/12')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({id: '12'})

    res = await request(server, '/nowhere')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({catch: 'nowhere'})

    res = await request(server, '/nowhere?foo=bar', { method: 'PUT' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({params: {catch: 'nowhere'}, method: 'put'})

    res = await request(server, '/nowhere', { method: 'OPTIONS' })
    expect(res.status).toBe(204)
    expect(await res.headers.get('allow')).toBe('OPTIONS,GET,PUT')

    server.close()
})

test('shorthand', async () => {
    let app = new Koa()

    app.use(GET('/', ctx => {
        ctx.body = 'root'
    }))

    app.use(POST('/', ctx => {
        ctx.body = { post: 'root' }
    }))

    let server = run(app)

    let res = await request(server, '/')
    expect(res.status).toBe(200)
    expect(await res.text()).toEqual('root')

    res = await request(server, '/', { method: 'POST' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({post: 'root'})

    server.close()
})

test('batch', async () => {
    let app = new Koa()
    let router = new Router()

    router.route('/posts/:id', id2int, {
        post (ctx) {
            ctx.body = ctx.params
        },
        delete (ctx) {
            ctx.body = `deleted: ${ctx.params.id}`
        }
    })

    app.use(router.routes())
    let server = run(app)

    let res = await request(server, '/posts', { method: 'POST' })
    expect(res.status).toBe(404)

    res = await request(server, '/posts/99', { method: 'POST' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({id: 99})

    res = await request(server, '/posts/0', { method: 'DELETE' })
    expect(res.ok).toBeTruthy()
    expect(await res.text()).toEqual('deleted: 0')

    res = await request(server, '/posts/1', { method: 'PUT' })
    expect(res.status).toBe(405)
    expect(res.headers.get('allow')).toBe('OPTIONS,POST,DELETE')

    server.close()
})
