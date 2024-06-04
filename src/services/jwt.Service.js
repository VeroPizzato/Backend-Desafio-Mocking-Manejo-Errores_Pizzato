const config = require('../config/config')
const { isValidPassword } = require('../utils/hashing')

class JwtServices {

    constructor(dao) {
        this.dao = dao
    }

    async login(email, password) {
        let user
        if (email === config.ADMIN_EMAIL && password === config.ADMIN_PASSWORD) {
            // Datos de sesión para el usuario coder Admin
            user = {
                first_name: "Usuario",
                last_name: "de CODER",
                age: 21,
                email: config.ADMIN_EMAIL,
                cart: null,
                rol: "admin",
                _id: "jh235hlki23463nkhlo"
            }
        }
        else if (email === config.SUPER_ADMIN_EMAIL && password === config.SUPER_ADMIN_PASSWORD) {
            // Datos de sesión para el usuario coder Admin
            user = {
                first_name: "Usuario",
                last_name: "de CODER",
                age: 40,
                email: config.SUPER_ADMIN_EMAIL,
                cart: null,
                rol: "superadmin",
                _id: "kflshGKSGNasbsgj3dae"
            }
        }
        else {
            user = await this.dao.login(email)
            if (!user) {
                //res.sendNotFoundError(err)
                //return res.status(404).json({ error: 'User not found!' })
                throw new Error('not found')
            }

            if (!isValidPassword(password, user.password)) {
                //return send.sendUnauthorized('Invalid password')
                //return res.status(401).json({ error: 'Invalid password' })
                throw new Error('invalid password')
            }
        }
        return user
    }
}

module.exports = { JwtServices }