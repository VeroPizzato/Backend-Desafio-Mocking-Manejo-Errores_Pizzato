const authorizationMiddleware = (rolParam) => {
    return (req, res, next) => {
        if (!req.user) {           
            return res.status(401).send({ error: 'User should authenticate' })
        }

        if (!req.user.rol || req.user.rol !== rolParam) {            
            return res.status(403).send({ error: 'User need permissions' })
        }

        next()
    }
}

module.exports = authorizationMiddleware