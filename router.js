const identChars = new Set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_")

class StaticSegment {
    constructor(value) {
        this.value = value
    }

    toString() {
        return `<StaticSegment ${this.value}>`
    }
}

class DynamicSegment {
    constructor(value) {
        this.value = value
    }

    toString() {
        return `<DynamicSegment ${this.value}>`
    }
}

const tokenize = (path) => {
    let segments = []
    let current
    for(let char of path) {
        if (char === ':') {
            if (current) {
                segments.push(current)
            }
            current = new DynamicSegment('')
        } else {
            if (!current) {
                current = new StaticSegment(char)
            } else if (current instanceof DynamicSegment && !identChars.has(char)) {
                segments.push(current)
                current = new StaticSegment(char)
            } else {
                current.value += char
            }
        }
    }
    if (current) {
        segments.push(current)
    }
    return segments
}
exports.tokenize = tokenize

const match = (input, rule) => {
    let cursor = 0
    let params = {}
    let [first, ...rest] = rule
    if (first instanceof StaticSegment) {
        if (!input.startsWith(first.value)) {
            return false
        }
        cursor = first.value.length
    } else {
        rest = rule
    }
    for (let i = 0; i < rest.length; i += 2) {
        let param
        if (i+1 >= rest.length) {
            param = input.substr(cursor)
            cursor = input.length
        } else {
            let index = input.indexOf(rest[i+1].value, cursor)
            if (index === -1) {
                return false
            }
            param = input.substring(cursor, index)
            cursor = index + rest[i+1].value.length
        }
        if (param.indexOf('/') !== -1) {
            return false
        }
        params[rest[i].value] = param
    }
    if (cursor < input.length) {
        return false
    }
    return params
}
exports.match = match

/*
    rules {
      [path]: {
        methods: Map {
          'GET' => metadata
        },
        segments: []
      }
    }
*/
class Router {
    constructor() {
        this.rules = new Map()
    }

    route(method, path, metadata) {
        if (!this.rules.has(path)) {
            this.rules.set(path, {
                methods: new Map(),
                segments: tokenize(path)
            })
        }
        this.rules.get(path).methods.set(method, metadata)
        return this
    }

    dispatch(method, input) {
        for (let [path, { segments, methods }] of this.rules.entries()) {
            let matched = match(input, segments)
            if (matched) {
                if (methods.has(method)) {
                    return { params: matched, metadata: methods.get(method) }
                } else if (method === 'OPTIONS')  {
                    return { status: 204, headers: { Allow: ['OPTIONS', ...methods.keys()].join(',') }}
                } else {
                    return { status: 405, headers: { Allow: [...new Set(['OPTIONS', ...methods.keys()])].join(',') }}
                }
            }
        }
        return {}
    }

    toString() {
        return [...this.rules.entries()].map(([path, { methods }]) => `${path} ${[...methods.keys()].join(',')}`).join("\n")
    }
}
exports.Router = Router
