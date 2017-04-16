const { dispatch, tokenize, Router } = require('./router')

test('tokenize', () => {
    expect(tokenize('/').join(',')).toBe('<StaticSegment />')
    expect(tokenize('/posts').join(',')).toBe('<StaticSegment /posts>')
    expect(tokenize('/:anything').join(',')).toBe('<StaticSegment />,<DynamicSegment anything>')
    expect(tokenize('/posts/:id').join(',')).toBe('<StaticSegment /posts/>,<DynamicSegment id>')
    expect(tokenize('/posts/:id/tags').join(',')).toBe('<StaticSegment /posts/>,<DynamicSegment id>,<StaticSegment /tags>')
    expect(tokenize('/:namespace/:hash.json').join(',')).toBe('<StaticSegment />,<DynamicSegment namespace>,<StaticSegment />,<DynamicSegment hash>,<StaticSegment .json>')
    expect(tokenize('/:namespace/:hash.:ext').join(',')).toBe('<StaticSegment />,<DynamicSegment namespace>,<StaticSegment />,<DynamicSegment hash>,<StaticSegment .>,<DynamicSegment ext>')
})

const router = new Router()
router.route('GET', '/', '/')
router.route('GET', '/posts', '/posts')
router.route('GET', '/:anything', '/:anything')
router.route('GET', '/posts/:id', '/posts/:id')
router.route('GET', '/posts/:id/tags', '/posts/:id/tags')
router.route('GET', '/:namespace/:hash.json', '/:namespace/:hash.json')
router.route('GET', '/:namespace/:hash.:ext', '/:namespace/:hash.:ext')

test('static routing', () => {
    expect(router.dispatch('GET', '/')).toEqual({params: {}, metadata: '/'})
    expect(router.dispatch('GET', '/posts')).toEqual({params: {}, metadata: '/posts'})
})

test('params', () => {
    expect(router.dispatch('GET', '/anything')).toEqual({params: {anything: 'anything'}, metadata: '/:anything'})
    expect(router.dispatch('GET', '/posts/1')).toEqual({params: {id: '1'}, metadata: '/posts/:id'})
    expect(router.dispatch('GET', '/posts/9/tags')).toEqual({params: {id: '9'}, metadata: '/posts/:id/tags'})
    expect(router.dispatch('GET', '/bucket/uuid-9.json')).toEqual({params: {namespace: 'bucket', hash: 'uuid-9'}, metadata: '/:namespace/:hash.json'})
    expect(router.dispatch('GET', '/bucket/uuid-9.png')).toEqual({params: {namespace: 'bucket', hash: 'uuid-9', ext: 'png'}, metadata: '/:namespace/:hash.:ext'})
    expect(router.dispatch('GET', '/post/9/tags')).toEqual({})
})
