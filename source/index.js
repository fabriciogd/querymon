import Schema from './schema'

/**
 * Create a middleware
 * 
 * @export
 * @returns Returns the middleware
 */
export function middleware () {
    return function (req, res, next) {
        let _schema = new Schema(req.query)

        _schema.validate((err) => {

            if (err) {
                req.querymen = {error: err}
                res.status(400)
                return next(err.message)
            }

            req.querymen = _schema.parse()
            next()
            
        })
    }
}