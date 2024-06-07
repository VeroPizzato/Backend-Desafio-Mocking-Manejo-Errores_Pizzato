const { ErrorCodes} = require("./errorCodes")
/**
 * @type {import("express").ErrorRequestHandler} *
 */

const errorHandler = (error, req, res, next) => {
    console.log(error.cause);
    switch (error.code) {
        case ErrorCodes.INVALID_TYPES_ERROR:
            res.status(400).send({status: 'error', error: error.name, cause: error.cause})
            break;
        case ErrorCodes.INVALID_PARAM_ERROR:
                res.status(400).send({status: 'error', error: error.name, cause: error.cause})
                break;
        default:
            res.status(500).send({status: 'error', error: "Unhandled error"})
            break;
    }

    next(error)
}

module.exports = { errorHandler}