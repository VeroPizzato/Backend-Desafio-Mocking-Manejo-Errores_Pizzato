//const { hashPassword } = require('../utils/hashing')
const passport = require('passport')
// const passportMiddleware = require('../utils/passportMiddleware')
// const authorizationMiddleware = require('../utils/authorizationMiddleware')
const { SessionController } = require('../controllers/session.controller')
const Router = require('./router')

const withController = callback => {
    return (req, res) => {                       
        const controller = new SessionController()
        return callback(controller, req, res)
    }
}

class SessionRouter extends Router {
    init() {

        // agregamos el middleware de passport para el login
        this.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/faillogin' }), withController((controller, req, res) => controller.login(req, res))) 

        this.get('/faillogin', withController((controller, req, res) => controller.faillogin(req, res))) 
       
        this.get('/logout', withController((controller, req, res) => controller.logout(req, res))) 
     
        // agregamos el middleware de passport para el register
        this.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/failregister' }), withController((controller, req, res) => controller.register(req, res))) 
       
        this.get('/failregister', withController((controller, req, res) => controller.failregister(req, res))) 

        this.post('/reset_password', passport.authenticate('reset_password', { failureRedirect: '/api/sessions/failreset' }), withController((controller, req, res) => controller.reset_password(req, res))) 
             
        this.get('/failreset', withController((controller, req, res) => controller.failreset(req, res))) 

        this.get('/github', passport.authenticate('github', { scope: ['user:email'] }), (req, res) => { })
        
        this.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), withController((controller, req, res) => controller.githubcallback(req, res))) 

        this.get('/current', withController((controller, req, res) => controller.current(req, res)))        
    }
}

module.exports = SessionRouter