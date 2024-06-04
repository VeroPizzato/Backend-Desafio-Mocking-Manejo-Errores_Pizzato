const passport = require('passport')
const localStrategy = require('passport-local')
const githubStrategy = require('passport-github2')
//const User = require('../dao/mongo/models/user.model')
const { User } = require('../dao')
const UserDAO = new User()

const { hashPassword, isValidPassword } = require('../utils/hashing')
const { Strategy, ExtractJwt } = require('passport-jwt')
const config = require('../config/config')

const LocalStrategy = localStrategy.Strategy
const GithubStrategy = githubStrategy.Strategy
const JwtStrategy = Strategy

const cookieExtractor = req => req && req.cookies ? req.cookies['accessToken'] : null

const initializeStrategy = () => {

    passport.use('jwt', new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: config.SECRET
    }, async (jwtPayload, done) => {
        try {
            return done(null, jwtPayload.user)  // req.user
        } catch (err) {
            done(err)
        }
    }))

    passport.use('github', new GithubStrategy({
        clientID: config.CLIENT_ID,
        clientSecret: config.CLIENT_SECRET,
        callbackURL: config.CALLBACK_URL
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            //console.log('Profile de github: ', profile, profile._json)

            //const user = await User.findOne({ email: profile._json.email })
            const user = await UserDAO.login({ email: profile._json.email })

            if (user) {
                return done(null, user)
            }

            // crear el usuario, ya que no existe
            const fullName = profile._json.name
            const first_name = fullName.substring(0, fullName.lastIndexOf(' '))
            const last_name = fullName.substring(fullName.lastIndexOf(' ') + 1)

            const newUser = {
                first_name,
                last_name,
                age: 47,
                email: profile._json.email,
                password: '',
                cart: null
            }

            //const result = await User.create(newUser)
            const result = await UserDAO.saveUser(newUser)
            return done(null, result)

        }
        catch (err) {
            done(err)
        }
    }))

    // estrategia para el registro de usuarios
    passport.use('register', new LocalStrategy({
        passReqToCallback: true, // habilitar el parámetro "req" en el callback de abajo
        usernameField: 'email'
    }, async (req, username, password, done) => {

        const { first_name, last_name, age, email } = req.body

        try {
            //const user = await User.findOne({ email: username })
            const user = await UserDAO.login({ email: username })
            if (user) {
                console.log('User already exists!')

                // null como 1er argumento, ya que no hubo error
                // false en el 2do argumento, indicando que no se pudo registrar
                return done(null, false)
            }

            const newUser = {
                first_name,
                last_name,
                age: +age,
                email,
                password: hashPassword(password),
                cart: null
            }
            //const result = await User.create(newUser)
            const result = await UserDAO.saveUser(newUser)

            // registro exitoso
            return done(null, result)
        }
        catch (err) {
            return done(err)
        }
    }))

    passport.use('reset_password', new LocalStrategy({
        usernameField: 'email'
    }, async (username, password, done) => {
        try {
            if (!username || !password) {
                return done(null, false)
            }

            let user
            if (username === config.ADMIN_EMAIL) {
                return done(null, false)
            }
            // 1. verificar que el usuario exista en la BD
            //user = await User.findOne({ email: username })
            user = await UserDAO.login({ email: username })
            if (!user) {
                return done(null, false)
            }

            // actualizar la nueva contraseña
            //await User.updateOne({ email: username }, { $set: { password: hashPassword(password) } })
            await UserDAO.updateUser({ email: username }, hashPassword(password))

            return done(null, user)
        }
        catch (err) {
            return done(err)
        }
    }))

    passport.use('login', new LocalStrategy({
        usernameField: 'email'
    }, async (username, password, done) => {
        try {
            if (!username || !password) {
                return done(null, false)
            }

            //let user = await User.findOne({ email: username });
            let user = await UserDAO.login({ email: username });          
            if (username === config.ADMIN_EMAIL && password === config.ADMIN_PASSWORD) {
                // Datos de sesión para el usuario coder Admin
                user = {
                    _id: "jh235hlki23463nkhlo",
                    first_name: "Usuario",
                    last_name: "de CODER",
                    age: 21,
                    email: username,
                    cart: null,
                    rol: "admin"
                };
                return done(null, user);
            }

            if (username === config.SUPER_ADMIN_EMAIL && password === config.SUPER_ADMIN_PASSWORD) {
                // Datos de sesión para el usuario coder superadmin
                user = {
                    _id: "kflshGKSGNasbsgj3dae",
                    first_name: "Usuario",
                    last_name: "de CODER",
                    age: 40,
                    email: username,
                    cart: null,
                    rol: "superadmin"
                };
                return done(null, user);
            }       
        
            // 1. verificar que el usuario exista en la BD           
            if (!user) {
                console.log("User doesn't exist")
                return done(null, false, "User doesn't exist");
            }

            // 2. validar su password
            if (!isValidPassword(password, user.password)) {
                return done(null, false, "Invalid Password");
            }

            return done(null, user);
        }
        catch (err) {
            done(err)
        }
    }))

    // al registrar o hacer login del usuario, pasamos el modelo de user al callback done
    // passport necesita serializar este modelo, para guardar una referencia al usuario en la sesión
    // simplemente podemos usar su id
    passport.serializeUser((user, done) => {
        // console.log('serialized!', user)
        if (user.email === config.ADMIN_EMAIL || user.email === config.SUPER_ADMIN_EMAIL) {
            // Serialización especial para los usuarios 'adminCoder@coder.com' y 'super@admin.com'
            done(null, { _id: user._id, first_name: user.first_name, last_name: user.last_name, age: user.age, email: user.email, rol: user.rol, cart: user.cart });
        } else {
            done(null, user._id)
        }
    })

    // para restaurar al usuario desde la sesión, passport utiliza el valor serializado y vuelve a generar al user
    // el cual colocará en req.user para que nosotros podamos usar
    passport.deserializeUser(async (id, done) => {
        //console.log('deserialized!', id)
        if (id.email === config.ADMIN_EMAIL || id.email === config.SUPER_ADMIN_EMAIL) {
            // Deserialización especial para los usuarios 'adminCoder@coder.com' y 'super@admin.com'
            done(null, id);
        } else {
            //const user = await User.findById(id);
            const user = await UserDAO.getUserById(id);
            done(null, user);
        }
    })
}

module.exports = initializeStrategy