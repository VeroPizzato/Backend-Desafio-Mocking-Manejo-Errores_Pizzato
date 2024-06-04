const { JwtServices } = require('../services/jwt.service')
const { User: UserDAO } = require('../dao')
const { UserDTO } = require('../dao/DTOs/user.dto')

class JwtController {

    constructor() {
        this.service = new JwtServices(new UserDAO())
    }

    login (req, res) {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return res.sendUserError('Invalid credentials!')
                //return res.status(400).send('Invalid credentials!')
            }
            const user = this.service.login(email, password)
            // const credentials = { id: user._id.toString(), email: user.email, rol: 'user' }
            const credentials = { id: user._id.toString(), email: user.email, rol: user.rol }
            const accessToken = generateToken(credentials)
            res.cookie('accessToken', accessToken, { maxAge: 60 * 1000, httpOnly: true })
            return res.sendSuccess('Logueado exitosamente!')
            //res.status(200).json('Logueado exitosamente!')
        }
        catch (err) {
            return res.sendServerError(err)
            //return res.status(500).json({ message: err.message })  
        }
    }

    private (req, res) {
        try {
            const { email } = req.authUser
            //res.send(`Welcome ${email}, this is private and protected content`)
            res.sendSuccess(`Welcome ${email}, this is private and protected content`)
        }
        catch (err) {
            return res.sendServerError(err)
            //return res.status(500).json({ message: err.message })
        }
    }

    current (req, res) {
        try {           
            res.sendSuccess(new UserDTO(req.user))
            //return res.json(req.user);
        }
        catch (err) {
            return res.sendServerError(err)
            //return res.status(500).json({ message: err.message })
        }
    }
}

module.exports = { JwtController }
