import _ from 'lodash'

/**
 * Defines default value formatter
 * 
 * @param {any} defaultValue Default value parameter value
 * @param {any} value Param value
 * @param {any} param Param
 * @returns Returns default value if null or undefined
 */
export const defaultValue = (defaultValue, value, param) => {
    if (defaultValue && _.isNil(value) || _.isNaN(value) || value === '') {
        value  = defaultValue;
    }
    return value
}

/**
 * Defines trim value function
 * 
 * @param {any} trim Trim parameter value
 * @param {any} value Param value
 * @param {any} param Param
 * @returns Returns value with removed leading and trailing whitespace or specified characters from string.
 */
export const trim = (trim, value, param) => {
    if (trim && _.isString(value)) {
        value  = _.trim(value);
    }
    return value
}