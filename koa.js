/**
 * koa intergartion
 * @module koa
 */
const compose = require('koa-compose')
const { Router: BaseRouter, match, tokenize } = require('./router')

/**
 * @extends BaseRouter
 */
exports.Router = class Router extends BaseRouter {
    /**
     * @returns {Function} koa middleware
     */
    routes () {
        return async (ctx, next) => {
            let { method, path } = ctx.request
            let { metadata, params, status, headers } = this.dispatch(method, path)
            if (metadata) {
                ctx.params = params
                await metadata(ctx, next)
            } else {
                if (status) {
                    ctx.status = status
                }
                if (headers) {
                    for (let [key, val] of Object.entries(headers)) {
                        ctx.set(key, val)
                    }
                }
                await next()
            }
        }
    }

    /**
     * @param {String} method
     * @param {String} path
     * @param {...Function} middlewares
     * @returns {Router} router
     */
    route (method, path, ...middlewares) {
        let last = middlewares[middlewares.length - 1]
        if (typeof last === 'object') {
            middlewares = [path, ...middlewares.splice(0, middlewares.length - 1)]
            path = method
            for (let [method, handler] of Object.entries(last)) {
                super.route(method.toUpperCase(), path, compose([...middlewares, handler]))
            }
        } else {
            super.route(method.toUpperCase(), path, compose(middlewares))
        }
        return this
    }

    /**
     * route a OPTIONS request
     * @param {String} path
     * @param {...Function} middlewares
     * @returns {Router} router
     */
    options(path, ...middlewares) { return this.route('OPTIONS', path, ...middlewares) }

    /**
     * route a HEAD request
     * @param {String} path
     * @param {...Function} middlewares
     */
    head(path, ...middlewares) { return this.route('HEAD', path, ...middlewares) }

    /**
     * route a GET request
     * @param {String} path
     * @param {...Function} middlewares
     */
    get(path, ...middlewares) { return this.route('GET', path, ...middlewares) }

    /**
     * route a POST request
     * @param {String} path
     * @param {...Function} middlewares
     */
    post(path, ...middlewares) { return this.route('POST', path, ...middlewares) }

    /**
     * route a PUT request
     * @param {String} path
     * @param {...Function} middlewares
     */
    put(path, ...middlewares) { return this.route('PUT', path, ...middlewares) }

    /**
     * route a PATCH request
     * @param {String} path
     * @param {...Function} middlewares
     */
    patch(path, ...middlewares) { return this.route('PATCH', path, ...middlewares) }

    /**
     * route a DELETE request
     * @param {String} path
     * @param {...Function} middlewares
     */
    delete(path, ...middlewares) { return this.route('DELETE', path, ...middlewares) }

}

const route =
/**
 * route a request
 * @param {String} method
 * @param {String} path
 * @param {...Function} middlewares
 */
exports.route = (method, path, ...middlewares) => {
    method = method.toUpperCase()
    let tokens = tokenize(path)
    let handler = compose(middlewares)
    return async (ctx, next) => {
        if (ctx.request.method !== method) {
            await next()
            return
        }
        let matched = match(ctx.request.path, tokens)
        if (matched) {
            ctx.params = matched
            await handler(ctx, next)
        } else {
            await next()
            return
        }
    }
}

const OPTIONS = 
/**
 * route a OPTIONS request
 * @param {String} path
 * @param {...Function} middlewares
 * @returns {Function} middleware
 */
exports.OPTIONS = (path, ...middlewares) => route('OPTIONS', path, ...middlewares)

const HEAD = 
/**
 * route a HEAD request
 * @param {String} path
 * @param {...Function} middlewares
 * @returns {Function} middleware
 */
exports.HEAD = (path, ...middlewares) => route('HEAD', path, ...middlewares)

const GET = 
/**
 * route a GET request
 * @param {String} path
 * @param {...Function} middlewares
 * @returns {Function} middleware
 */
exports.GET = (path, ...middlewares) => route('GET', path, ...middlewares)

const POST = 
/**
 * route a POST request
 * @param {String} path
 * @param {...Function} middlewares
 * @returns {Function} middleware
 */
exports.POST = (path, ...middlewares) => route('POST', path, ...middlewares)

const PUT =
/**
 * route a PUT request
 * @param {String} path
 * @param {...Function} middlewares
 * @returns {Function} middleware
 */
exports.PUT = (path, ...middlewares) => route('PUT', path, ...middlewares)


const PATCH =
/**
 * route a PATCH request
 * @param {String} path
 * @param {...Function} middlewares
 * @returns {Function} middleware
 */
exports.PATCH = (path, ...middlewares) => route('PATCH', path, ...middlewares)

const DELETE =
/**
 * route a DELETE request
 * @param {String} path
 * @param {...Function} middlewares
 * @returns {Function} middleware
 */
exports.DELETE = (path, ...middlewares) => route('DELETE', path, ...middlewares)
