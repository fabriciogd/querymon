import _ from 'lodash'
import * as validators from './validators'
import * as formatters from './formatters'

/**
 * Represents query string param
 * 
 * @export
 * @class Param
 */
export default class Param  {

    /**
     * Creates an instance of Param.
     * @param {any} name Param name
     * @param {any} value Param value
     * @param {any} options Param options
     * 
     * @memberof Param
     */
    constructor(name, value, options) {
        this._handlers = {
            formatters: {},
            validators: {}
        }

        this._separator = ','

        _.keys(validators).forEach((key) => {  this.validator(key, validators[key]) })
        _.keys(formatters).forEach((key) => {  this.formatter(key, formatters[key]) })

        this._name = name
        this._options = options

        this.value(value)
    }

    /**
     * Returns param name
     * 
     * @readonly
     * 
     * @memberof Param
     */
    get name() {
        return this._name
    }

    /**
     * Set/Get options of the param
     * 
     * @param {any} name Option name
     * @param {any} value Option value
     * @returns Returns options value
     * 
     * @memberof Param
     */
    option (name, value) {
        if (arguments.length > 1) {
            this._options[name] = value
        }

        return this._options[name]
    }

    /**
     * Convert to the correct value
     * 
     * @param {any} value Value to assert
     * @returns Returns asserted value
     * 
     * @memberof Param
     */
    assert (value){
        var type = this.type(value)

        if (!_.isNil(value)) {
            if (type.name === 'RegExp') {
                value = new RegExp(value, 'i')
            } else if (type.name === 'Date') {
                value = new Date(/^\d{5,}$/.test(value) ? Number(value) : value)
            } else if (type.name === 'Boolean') {
                value = !(value === 'false' || value === '0' || !value)
            } else if (type.name === 'Number') {
                value = Number(value)
            } else if (type.name === 'Object') {
                value = Object(value)
            } else {
                value = String(value)
            }
        }

        return this.format(value)
    }

    /**
     * Set/Get value of the param
     * 
     * @param {any} value Value of the param
     * @param {boolean} [bind=true] Flag to identify if set the param value
     * @returns Returns setted value
     * 
     * @memberof Param
     */
    value (value, bind = true){
        if (arguments.length === 0) {
            return this._value
        }
        
        let values = value

        if (_.isString(values) && ~value.search(this._separator)) {
            values = value.split(this._separator)
        } 

        if (_.isArray(values)) {
            values = values.map((value) => this.value(value, false))

            if (bind) {
                this._value = values
            }

            return values
        }

        values = this.assert(values)

        if (bind) {
            this._value = values
        }

        return values
    }

    /**
     * Format the value
     * 
     * @param {any} value Value of the param
     * @returns Returns formatted value
     * 
     * @memberof Param
     */
    format (value) {
        for (let option in this._options) {
            
            let optionValue = this._options[option]

            let formatter = this.formatter(option)

            if (_.isFunction(formatter)) {
                value = formatter(optionValue, value, this)
            }
        }

        return value;
    }

    /**
     * Set/Get a handler
     * 
     * @param {any} type Handler type
     * @param {any} name Handler name
     * @param {any} fn Handler function
     * @returns Returns created handler
     * 
     * @memberof Param
     */
    handler (type, name, fn)  {
        if (arguments.length > 2) {
            this._handlers[type][name] = fn
        }

        return this._handlers[type][name]
    }

    /**
     * Get/Set param formatter
     * 
     * @param {any} name Formatter name
     * @param {any} fn Formatter function
     * @returns Returns registered formatter
     * 
     * @memberof Param
     */
    formatter (name, fn) {
        return this.handler.call(this, 'formatters', ...arguments)
    }

     /**
     * Get/Set param validator
     * 
     * @param {any} name Validator name
     * @param {any} fn Validator function
     * @returns Returns registered validator
     * 
     * @memberof Param
     */
    validator (name, fn) {
        return this.handler.call(this, 'validators', ...arguments)
    }

    /**
     * Validates the param
     * 
     * @param {any} [next=(error) => !error] Error function
     * @param {any} [value=this._value] Param value
     * @returns Returns validated param
     * 
     * @memberof Param
     */
    validate(next = (error) => !error, value = this._value) {
        let error

        if (_.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
                this.validate((err) => { error = err }, value[i])
                if (error) break
            }

            return next(error)
        }

        for (let option in this._options) {
            let optionValue = this._options[option]
            let validator

            validator = this.validator(option)
            
            if (!_.isFunction(validator))
                continue

            let validation = validator(optionValue, value, this)

            if (!validation.valid) {

                error = _.assign({
                    name: option,
                    param: this._name,
                    value: value,
                    [option]: optionValue
                }, validation)

                break
            }
        }

        return next(error)
    }

    /**
     * Parse the param
     * 
     * @returns Returns parsed param
     * 
     * @memberof Param
     */
    parse () {
        let parser
        let query = {}

        for (let option in this._options) {
            let optionValue = this._options[option]
        
            if (option === 'parse' && _.isFunction(optionValue))
                parser = optionValue
            else
                continue
            
            query = parser(this._value, this)
        }

        return query
    }

    /**
     * Get param type
     * 
     * @param {any} [value=this._value] Param value
     * @returns Returns param type
     * 
     * @memberof Param
     */
    type (value = this._value) {
        if (_.isNil(value)) {
            return String
        } else if (_.isNumber(value)) {
            return Number
        } else if (_.isBoolean(value) || new RegExp('^(true|false|1|0)$').test(value)) {
            return Boolean
        } else if (_.isDate(value)) {
            return Date
        } else if (_.isRegExp(value)) {
            return RegExp
        } else {
            return String
        }
    }
}