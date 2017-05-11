import _ from 'lodash'

/**
 * Defines required validator
 * 
 * @param {any} required Required parameter value
 * @param {any} value Param value
 * @param {any} param Param
 */
export const required = (required, value, param) => ({
    valid: !required || !_.isNil(value) && !_.isNaN(value) && value !== '',
    message: `${param.name} is required`
})

/**
 * Defines min validator
 * 
 * @param {any} min Min parameter value
 * @param {any} value Param value
 * @param {any} param Param
 */
export const min = (min, value, param) => ({
    valid: _.isNil(value) || value >= min,
    message: `${param.name} must be greater than or equal to ${min}`
})

/**
 * Defines max validator
 * 
 * @param {any} max Max parameter value
 * @param {any} value Param value
 * @param {any} param Param
 */
export const max = (max, value, param) => ({
    valid: _.isNil(value) || value <= max,
    message: `${param.name} must be lower than or equal to ${max}`
})