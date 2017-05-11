import _ from 'lodash'
import Param from "./param";

/**
 * Represents schema parser
 * 
 * @export
 * @class Schema
 */
export default class Schema {

    /**
     * Creates an instance of Schema.
     * @param {any} params Query string params
     * 
     * @memberof Schema
     */
    constructor(params) {
        this._params = [];

        this._parsers = {
            limit: {
                type: Number,
                defaultValue: 30,
                max: 100,
                min: 1,
                bindTo: 'cursor',
                parse: (value) => ({limit: value})
            },
            page: {
                type: Number,
                defaultValue: 1,
                max: 30,
                min: 1,
                bindTo: 'cursor',
                parse: (value, param) => {
                    return { skip: this.param('limit').value() * (value - 1) }
                }
            },
            sort: {
                type: String,
                defaultValue: '-createdAt',
                bindTo: 'cursor',
                parse: (value) => {
                    let fields = _.isArray(value) ? value : [value]
                    let sort = {}

                    fields.forEach((field) => {
                        if (field.charAt(0) === '-') {
                            sort[field.slice(1)] = -1
                        } else if (field.charAt(0) === '+') {
                            sort[field.slice(1)] = 1
                        } else {
                            sort[field] = 1
                        }
                    })

                    return { sort: sort };
                }
            },
            fields: {
                bindTo: 'select',
                parse: (value) => {
                    let fields = _.isArray(value) ? value : [value]

                    let query = {}

                    fields.forEach((field) => {
                        if (_.isNil(field) || _.isEmpty(field)) 
                            return

                        if (field.charAt(0) === '-') {
                            query[field.slice(1)] = 0
                        } else if (field.charAt(0) === '+') {
                            query[field.slice(1)] = 1
                        } else {
                            query[field] = 1
                        }
                    })

                    return query
                }
            },
            query: {
                bindTo: 'filter',
                opts: ['!', '~', '^', '$', '>', '<'],
                required: true,
                parse: function(value, param) {
                    let query = {},
                        ret,
                        i;

                    let fn = function(value, array = false){
                        let op, eq;

                        op = value[0],
                        eq = value[1] === '=';

                        value = value.substr(eq ? 2 : 1) || '';

                        value = param.assert(value)

                        const ret = { value: value };

                        switch (op) {
                            case '^':
                            case '$':
                            case '~':
                                ret.field = '$regex';
                                ret.options = 'i';

                                switch (op) {
                                    case '^':
                                        ret.value = `^${value}`;
                                    break;
                                    case '$':
                                        ret.value = `${value}$`;
                                    break;
                                    default:
                                        break;
                                }
                                break;
                            case '>':
                                ret.field = eq ? '$gte' : '$gt';
                                break;
                            case '<':
                                ret.field = eq ? '$lte' : '$lt';
                                break;
                            case '!':
                                if(array)
                                    ret.field = '$nin';
                                else
                                    ret.field = '$ne';
                                break;
                            default:
                                if(array)
                                    ret.field = '$in';
                                else {
                                    ret.field = '$eq';
                                }
                        }

                        ret.parsed = {};
                        ret.parsed[ret.field] = ret.value;

                        if (ret.options) {
                            ret.parsed.$options = ret.options;
                        }

                        return ret;
                    }
                    
                    if(_.isNil(value))
                        return;
                    
                    if (typeof value !== 'string')
                        value = _.toString(value);

                    if(_.isArray(value)) {
                        for (i = 0; i < value.length; i += 1) {
                            ret = fn(value[i], true)

                            switch (ret.field) {
                                case '$in':
                                case '$nin':
                                    query[ret.field] = query[ret.field] || [];
                                    query[ret.field].push(ret.value);
                                    break;
                            }
                        }
                    }
                    else if(~param.option('opts').indexOf(value[0])){
                        ret = fn(value, false)
                        query = ret.parsed
                    }
                    else {
                        query = param.assert(value)
                    }

                    return {[param.name]: query}
                }
            }
        }

        let keys = _.union(_.keys(this._parsers), _.keys(params))
        keys.forEach((key) => this.add(key, params[key]))
    }

    /**
     * Get param by name
     * 
     * @param {any} name Param name
     * @returns Returns founded param
     * 
     * @memberof Schema
     */
    param (name) {
        return this._params[name]
    }

    /**
     * Creates new param
     * 
     * @param {any} name Param name
     * @param {any} value Param value
     * 
     * @memberof Schema
     */
    add (name, value){
        let options = this.parser(name)

        name = name.replace(/\[]$/, '')
        
        this._params[name] = new Param(name, value, options)
    }

    /**
     * Get parser by name
     * 
     * @param {any} name Parser name
     * @returns Returns founded parser
     * 
     * @memberof Schema
     */
    parser (name) {
        let parser

        switch(name){
            case 'limit': 
                parser = this._parsers.limit
                break
            case 'page': 
                parser = this._parsers.page
                break
            case 'sort': 
                parser = this._parsers.sort
                break
            case 'fields': 
                parser = this._parsers.fields
                break
            default:
                parser = this._parsers.query
        }

        return parser
    }

    /**
     * Validates the param
     * 
     * @param {any} [next=(error) => !error] Error function
     * @returns Returns validated param
     * 
     * @memberof Schema
     */
    validate (next = (error) => !error) {
        let error

        for (let i in this._params) {
            let param = this._params[i]

            param.validate(param.value, (err) => { error = err })
        }
        
        return next(error)
    }
    
    /**
     * Parse param
     * 
     * @returns Returns parsed param
     * 
     * @memberof Schema
     */
    parse () {
        let query = {}

        for (let i in this._params) {
            let param = this._params[i]
            let bind = param.option('bindTo')
            
            query[bind] = _.assign(query[bind], param.parse())
        }

        return query;
    }
}