const jwt = require('jsonwebtoken')
const config = require('../config/config')

const PRIVATE_KEY = config.SECRET

const generateToken = user => {
    const token = jwt.sign({ user }, PRIVATE_KEY, { expiresIn: '24h' })
    return token
}

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization  // Authorization: "Bearer token"
    if (!authHeader) {        
        return res.status(401).json({ error: 'Not authenticated!' })
    }

    const [, token] = authHeader.split(' ')
    jwt.verify(token, PRIVATE_KEY, (err, signedPayload) => {
        if (err) {           
            return res.status(403).json({ error: 'Invalid access token!' })
        }

        req.authUser = signedPayload.user
        next()
    })
}

module.exports = { generateToken, verifyToken, secret: PRIVATE_KEY }