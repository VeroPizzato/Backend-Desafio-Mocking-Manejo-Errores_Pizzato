const { isValidPassword } = require('../utils/hashing')
const { generateToken, verifyToken } = require('../utils/jwt')
// const passport = require('passport')
const passportMiddleware = require('../utils/passportMiddleware')
const authorizationMiddleware = require('../utils/authorizationMiddleware')
const { JwtController } = require('../controllers/jwt.controller')
const config = require('../config/config')
const Router = require('./router')

const withController = callback => {
    return (req, res) => {        
        const controller = new JwtController()
        return callback(controller, req, res)
    }
}

class JwtRouter extends Router {
    init() {

        this.post('/login', withController((controller, req, res) => controller.login(req, res)))

        this.get('/private', verifyToken, withController((controller, req, res) => controller.private(req, res)))

        this.get('/current', passportMiddleware('jwt'), withController((controller, req, res) => controller.current(req, res))) 
    }
}
module.exports = JwtRouter