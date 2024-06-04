const express = require('express')
const handlebarsExpress = require('express-handlebars')
const { Server } = require('socket.io')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const cookieParser = require('cookie-parser')
const config = require('./config/config')

const CartsRouter = require('./routes/carts.router')
const cartsRouter = new CartsRouter().getRouter()

const ProductsRouter = require('./routes/products.router')
const productsRouter = new ProductsRouter().getRouter()

const SessionRouter = require('./routes/session.router')
const sessionRouter = new SessionRouter().getRouter()

const JwtRouter = require('./routes/jwt.router')
const jwtRouter = new JwtRouter().getRouter()

const ViewsRouter = require('./routes/views.router')
const viewsRouter = new ViewsRouter().getRouter()

const chatModel = require('./dao/mongo/models/chat.model')

const passport = require('passport')

const initializeStrategy = require('./config/passport.config')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(`${__dirname}/../public`))

// configuramos handlebars 
const handlebars = handlebarsExpress.create({
    defaultLayout: "main",
    handlebars: require("handlebars"),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true
    }
})
app.engine("handlebars", handlebars.engine)
app.set("views", `${__dirname}/views`)
app.set("view engine", "handlebars")

app.use('/products/detail', express.static(`${__dirname}/../public`));  // para encontrar la carpeta public
app.use('/products/addCart', express.static(`${__dirname}/../public`));  // para encontrar la carpeta public
app.use('/carts', express.static(`${__dirname}/../public`));

app.use(session({
    store: MongoStore.create({
        dbName: config.DB_NAME,
        mongoUrl: config.MONGO_URL,
        ttl: 60
    }),
    secret: 'secretCoder',
    resave: true,
    saveUninitialized: true
}));

app.use(cookieParser())
initializeStrategy()
app.use(passport.initialize())
app.use(passport.session())

const main = async () => {

    // configurar rutas de nuestro backend
    const routers = [        
        { path: '/api/products', router: productsRouter },
        { path: '/api/carts', router: cartsRouter },
        { path: '/', router: viewsRouter },
        { path: '/api/sessions', router: sessionRouter },
        { path: '/api', router: jwtRouter }
    ]

    for (const { path, router } of routers) {
        app.use(path, await router)
    }

    await mongoose.connect(config.MONGO_URL,
        {
            dbName: config.DB_NAME
        })
    
    const httpServer = app.listen(config.PORT, () => {
        console.log('Servidor listo!!')
    })

    // creando un servidor para ws
    const io = new Server(httpServer)
    app.set('ws', io)

    let messagesHistory = []

    io.on('connection', (clientSocket) => {
        console.log(`Cliente conectado con id: ${clientSocket.id}`)

        // enviar todos los mensajes hasta ese momento
        for (const data of messagesHistory) {
            clientSocket.emit('message', data)
        }

        clientSocket.on('message', async data => {
            messagesHistory.push(data)

            try {
                const { user, text } = data
                const chatMessage = new chatModel({
                    user,
                    text
                })

                // Se persiste en Mongo
                const result = await chatMessage.save()

                console.log(`Mensaje de ${user} persistido en la base de datos.`)
            } catch (error) {
                console.error('Error al persistir el mensaje:', error)
            }

            io.emit('message', data)
        })

        clientSocket.on('authenticated', data => {
            clientSocket.broadcast.emit('newUserConnected', data)  // notificar a los otros usuarios que se conecto
        })

        // Escucho el evento 'deleteProduct' emitido por el cliente
        clientSocket.on('deleteProduct', async (productId) => {
            try {
                await ProductManager.deleteProduct(productId);
                // Emitir evento 'productDeleted' a los clientes
                io.emit('productDeleted', productId);
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        })

    })
}

main()