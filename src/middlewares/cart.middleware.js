//const { CartsStorage } = require('../persistence/carts.storage')
const { Cart } = require('../dao')
const { CartsService } = require('../services/carts.service')
//const { ProductsStorage } = require('../persistence/products.storage')
const { Product } = require('../dao')
const { ProductsService } = require('../services/products.service')

const cartDAO = new Cart()
const cartsService = new CartsService(cartDAO)
const productDAO = new Product()
const productsService = new ProductsService(productDAO)

module.exports = {
    // Middleware para validacion de datos al agregar un carrito 
    validarNuevoCarrito: async (req, res, next) => {
        try {            
            const { products } = req.body
            products.forEach(async producto => {
                const prod = await productsService.getProductById(producto._id)
                if (!prod) {
                    return prod === false
                    ? res.status({ message: 'Not found!' }, 404)
                    : res.status({ message: 'Something went wrong!' })
                }
                if (isNaN(producto.quantity) || (!ProductManager.soloNumPositivos(producto.quantity))) {
                    res.status(400).json({ error: "Invalid quantity format" })
                    return
                }
            })
            next()
        }
        catch {
            return res.status(400).json({ error: "Carrito nuevo invalido." })
        }
    },

    // Middleware para validacion de carrito existente 
    validarCarritoExistente: async (req, res, next) => {
        try {
            let cId = req.params.cid
            // if (isNaN(cId)) {
            //     res.status(400).json({ error: "Invalid number format" })
            //     return
            // }
            const cart = await cartsService.getCartByCId(cId)
            if (!cart) {
                return cart === false
                    ? res.status({ message: 'Not found!' }, 404)
                    : res.status({ message: 'Something went wrong!' })
            }

            next()
        }
        catch {
            return res.status(400).json({ error: "No existe el carrito." })
        }
    }
}