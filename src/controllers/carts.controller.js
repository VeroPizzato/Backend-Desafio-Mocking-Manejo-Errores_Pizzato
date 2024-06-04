const { CartsService } = require('../services/carts.service')
const { ProductsService } = require('../services/products.service')
const { Cart: CartDAO, Product: ProductDAO } = require('../dao')
const { CartDTO } = require('../dao/DTOs/cart.dto')
const { addTicket } = require('./ticket.controller')

class CartsController {

    constructor() {
        this.cartsService = new CartsService(new CartDAO())
        this.productsService = new ProductsService(new ProductDAO())
    }

    async getCarts(req, res) {
        try {
            const carts = await this.cartsService.getCarts()
            const cartsDTO = carts.map(cart => new CartDTO(cart))
            return res.sendSuccess(cartsDTO)
        }
        catch (err) {
            return res.sendServerError(err)
            // return res.status(500).json({
            //     message: err.message
            // })
        }
    }

    async getCartByCId(req, res) {
        try {
            let cidCart = req.cid
            let cartByCID = await this.cartsService.getCartByCId(cidCart)
            if (!cartByCID) {
                return cartByCID === false
                    ? res.sendNotFoundError({ message: 'Not found!' }, 404)
                    : res.sendServerError({ message: 'Something went wrong!' })
            }
            res.sendSuccess(new CartDTO(cartByCID))
            //res.status(200).json(cartByCID)    // HTTP 200 OK
        }
        catch {
            return res.sendServerError(err)
            // return res.status(500).json({
            //     message: err.message
            // })
        }
    }

    async addCart(req, res) {
        try {
            let { products } = req.body
            await this.cartsService.addCart(products)
            res.sendCreatedSuccess('Carrito agregado correctamente')
            //res.status(201).json({ message: "Carrito agregado correctamente" })  // HTTP 201 OK

        } catch (err) {
            res.sendUserError(err)
            // return res.status(400).json({
            //     message: err.message
            // })
        }
    }

    async createProductToCart(req, res) {
        try {
            let idCart = req.cid
            let idProd = req.pid
            let quantity = 1
            await this.cartsService.addProductToCart(products)
            res.sendSuccess(`Se agregaron ${quantity} producto/s con ID ${idProd} al carrito con ID ${idCart}`)
            //res.status(200).json(`Se agregaron ${quantity} producto/s con ID ${idProd} al carrito con ID ${idCart}`)    // HTTP 200 OK
        } catch (err) {
            return res.sendServerError(err)
            // return res.status(500).json({
            //     message: err.message
            // })
        }
    }

    async updateCartProducts(req, res) {
        try {
            let cartId = req.cid
            const { products } = req.body
            await this.cartsService.updateCartProducts(products)
            // HTTP 200 OK
            res.status(200).json(`Los productos del carrito con ID ${cartId} se actualizaron exitosamente.`)
        }
        catch (err) {
            return res.sendServerError(err)
            // return res.status(500).json({ message: err.message })
        }
    }

    async updateProductToCart(req, res) {
        try {
            let cartId = req.cid
            let prodId = req.pid
            const quantity = +req.body.quantity
            const result = await this.cartsService.addProductToCart(cartId, prodId, quantity)
            if (result)
                // HTTP 200 OK
                res.status(200).json(`Se agregaron ${quantity} producto/s con ID ${prodId} al carrito con ID ${cartId}.`)
            else {
                //HTTP 400
                res.sendUserError(err)
                //res.status(400).json({ error: "Sintaxis incorrecta!" })
            }
        }
        catch (err) {
            return res.sendServerError(err)
            // return res.status(500).json({ message: err.message })
        }
    }

    async deleteCart(req, res) {
        try {
            let cartId = req.cid
            await this.cartsService.deleteCart(cartId)
            res.status(200).json({ message: "Carrito eliminado correctamente" })  // HTTP 200 OK
        } catch (err) {
            return res.sendServerError(err)
            // return res.status(500).json({
            //     message: err.message
            // })
        }
    }

    async deleteProductToCart(req, res) {
        try {
            let cartId = req.cid
            let prodId = req.pid
            const result = await this.cartsService.deleteProductToCart(cartId, prodId)
            if (result)
                // HTTP 200 OK
                res.status(200).json(`Se eliminó el producto con ID ${prodId} del carrito con ID ${cartId}.`)
            else {
                res.sendUserError(err)
                // HTTP 400
                //res.status(400).json({ error: "Sintaxis incorrecta!" })
            }
        }
        catch (err) {
            return res.sendServerError(err)
            // return res.status(500).json({ message: err.message })
        }
    }

    // async deleteAllProductCart (req, res) {
    //     try {
    //         let cartId = req.cid
    //         await this.cartsService.deleteAllProductCart(cartId)
    //         res.status(200).json({ message: "Carrito vaciado correctamente" })  // HTTP 200 OK
    //     } catch (err) {
    //         return res.sendServerError(err)
    //         // return res.status(500).json({
    //         //     message: err.message
    //         // })
    //     }
    // }

    async HayStock(id, quantity) {
        try {
            const producto = await this.productsService.getProductById(id)
            const stock = producto.stock
            if (stock < quantity) {
                return false
            } else {
                return true
            }
        }
        catch (err) {
            return res.sendServerError(err)
        }
    }

    async finalizarCompra(req, res) {
        try {
            let cartId = req.cid
            let carrito = await this.cartsService.getCartByCId(cartId)
            let usuarioCarrito = req.session.user.email
            let totalCarrito = 0
            let cantidadItems = 0
            let cartItemsSinStock = []
            let arrayCartPendientes = []
            if (carrito) {
                await Promise.all(carrito.products.map(async (item) => {
                    const id = item._id._id.toString()
                    let hayStock = await this.HayStock(id, item.quantity)
                    if (hayStock) {
                        const stockAReducir = item.quantity
                        const result = await this.productsService.updateProduct(id, { $inc: { stock: -stockAReducir } })
                        const subtotal = stockAReducir * item._id.price
                        totalCarrito += subtotal
                        cantidadItems += item.quantity
                    } else {
                        arrayCartPendientes.push(item)
                        cartItemsSinStock.push(item._id._id.toString())
                    }
                }))

                if (totalCarrito > 0) {
                    const newTicket = {
                        code: this.generarCodUnico(),
                        amount: totalCarrito,
                        purchaser: usuarioCarrito
                    }

                    const ticketCompra = await addTicket(newTicket)  // GENERAR TICKET
                }
                //console.log(arrayCartPendientes)
                const prodSinComprar = await this.cartsService.updateCartProducts(cartId, arrayCartPendientes)  // quedan en el carrito los productos que no se pudieron comprar

                //console.log(cartItemsSinStock)
                return res.sendSuccess(cartItemsSinStock)  // devuelvo los id de los productos que no se puderon comprar
            }
        }
        catch (err) {
            return res.sendServerError(err)
        }
    }

    generarCodUnico() {
        return new Date().getTime().toString()
    }
}

module.exports = { CartsController }