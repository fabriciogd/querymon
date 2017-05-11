import assert from 'assert';
import Param from './source/param'
import Schema from './source/schema'

let param = (value, options) => new Param('test', value, options)

describe('query param constructor options', () => {
    let value = (value, options) => param(value, options).value()

    it('not set default value string', () => { assert.deepEqual(value('foo', {defaultValue: 'bar'}), 'foo') })
    it('set default value string', () => { assert.deepEqual(value(null, {defaultValue: 'bar'}), 'bar') })
    it('trim value string', () => { assert.deepEqual(value(' foo ', {trim: true}), 'foo') })
    it('not trim value string', () => { assert.deepEqual(value(' foo ', {trim: false}), ' foo ') })
})

describe('query param constructor options with multple values', () => {
    let value = (value, options) => param(value, options).value()

    it('not set default value string', () => { assert.deepEqual(value('foo,bar', {defaultValue: 'bar'}), ['foo','bar']) })
    it('set default value string', () => { assert.deepEqual(value('foo,', {defaultValue: 'bar'}), ['foo','bar']) })
    it('trim value string', () => { assert.deepEqual(value(' foo , bar ', {trim: true}), ['foo','bar']) })
    it('not trim value string', () => { assert.deepEqual(value(' foo , bar ', {trim: false}), [' foo ', ' bar ']) })
})


describe('query param validate', () => {
    let validate = (...args) => param(...args).validate()

    it('validate required with error', () => { assert.deepEqual(validate(null, { required: true }), false) })
    it('validate required with no error', () => { assert.deepEqual(validate('foo', { required: true }), true) })
    it('validate null min value with no error', () => { assert.deepEqual(validate(null, { min: 10 }), true) })
    it('validate min value with error', () => { assert.deepEqual(validate(1, { min: 10 }), false) })
    it('validate min value with no error', () => { assert.deepEqual(validate(11, { min: 10 }), true) })
})

describe('schema parse limit', () => {
    let schema = (...args) => new Schema(...args).parse()

    it('set default value limit param', () => { assert.deepEqual(schema({}).cursor, { limit: 30, skip: 0, sort: { createdAt: -1 }  }) })
    it('set default null value limit param', () => { assert.deepEqual(schema({limit: null}).cursor, { limit: 30, skip: 0, sort: { createdAt: -1 }  }) })
    it('set value to limit param', () => { assert.deepEqual(schema({limit: 2}).cursor, { limit: 2, skip: 0, sort: { createdAt: -1 }  }) })
})

describe('schema parse page', () => {
    let schema = (...args) => new Schema(...args).parse()

    it('set default value page param', () => { assert.deepEqual(schema({}).cursor, { limit: 30, skip: 0, sort: { createdAt: -1 } }) })
    it('set default null value page param', () => { assert.deepEqual(schema({page: null}).cursor, { limit: 30, skip: 0, sort: { createdAt: -1 } }) })
    it('set value to page param', () => { assert.deepEqual(schema({page: 2}).cursor, { limit: 30, skip: 30, sort: { createdAt: -1 }  }) })
})


describe('schema parse sort', () => {
    let schema = (...args) => new Schema(...args).parse()

    it('set default value sort param', () => { assert.deepEqual(schema({}).cursor, { limit: 30, skip: 0, sort: { createdAt: -1 }}) })
    it('set default null value sort param', () => { assert.deepEqual(schema({sort: null}).cursor, { limit: 30, skip: 0, sort: { createdAt: -1 }}) })
    it('set value sort param', () => { assert.deepEqual(schema({sort: '-a'}).cursor, { limit: 30, skip: 0, sort: { a: -1 }}) })
    it('set multiple value sort param', () => { assert.deepEqual(schema({sort: '-a,b'}).cursor, { limit: 30, skip: 0, sort: { a: -1,b: +1 }}) })
})

describe('schema parse fields', () => {
    let schema = (...args) => new Schema(...args).parse()

     it('set value fields param', () => { assert.deepEqual(schema({fields: 'a'}).select, {a: 1}) })
     it('set value fields param', () => { assert.deepEqual(schema({fields: 'a,-b'}).select, {a: 1, b: 0}) })
})

describe('schema parse param', () => {
    let schema = (...args) => new Schema(...args).parse()

    it('set string value param', () => { assert.deepEqual(schema({foo: 'bar'}).filter, {foo: 'bar'}) })
    it('set int value param', () => { assert.deepEqual(schema({foo: '1'}).filter, {foo: 1}) })
    it('set bool value param', () => { assert.deepEqual(schema({foo: 'true'}).filter, {foo: true}) })
    it('set bool value param', () => { assert.deepEqual(schema({foo: 'false'}).filter, {foo: false}) })
    it('set date value param', () => { assert.deepEqual(schema({foo: '12/02/2015'}).filter, {foo: '12/02/2015'}) })
})
