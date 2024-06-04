const { validarNuevoProducto } = require('../middlewares/product.middleware')
const { userIsLoggedIn, userIsNotLoggedIn, userIsAdmin, userIsUser } = require('../middlewares/auth.middleware')
const { ViewsController } = require('../controllers/views.controller')

const Router = require('./router')

const withController = callback => {
    return (req, res) => {                        
        const controller = new ViewsController()
        return callback(controller, req, res)
    }
}

class ViewsRouter extends Router {
    init() {       
        this.get('/', withController((controller, req, res) => controller.home(req, res)))

        this.get('/login', userIsNotLoggedIn, withController((controller, req, res) => controller.login(req, res)))
        
        this.get('/reset_password', userIsNotLoggedIn, withController((controller, req, res) => controller.reset_password(req, res)))

        this.get('/register', userIsNotLoggedIn, withController((controller, req, res) => controller.register(req, res)))

        this.get('/profile', userIsLoggedIn, withController((controller, req, res) => controller.profile(req, res)))
        
        this.get('/products', userIsLoggedIn, withController((controller, req, res) => controller.getProducts(req, res)))

        this.get('/products/detail/:pid', userIsLoggedIn, withController((controller, req, res) => controller.getProductDetail(req, res)))

        this.get('/products/addcart/:pid', userIsLoggedIn, userIsUser, withController((controller, req, res) => controller.addProductToCart(req, res)))

        this.get('/carts/:cid', userIsLoggedIn, withController((controller, req, res) => controller.getCartById(req, res)))

        this.get('/realtimeproducts', userIsLoggedIn, userIsAdmin, withController((controller, req, res) => controller.getRealTimeProducts(req, res)))

        this.post('/realtimeproducts', validarNuevoProducto, userIsLoggedIn, userIsAdmin, withController((controller, req, res) => controller.postRealTimeProducts(req, res)))

        this.get('/newProduct', userIsLoggedIn, userIsAdmin, withController((controller, req, res) => controller.newProduct(req, res)))

        this.get('/chat', withController((controller, req, res) => controller.chat(req, res)))   
            
    }
}

module.exports = ViewsRouter