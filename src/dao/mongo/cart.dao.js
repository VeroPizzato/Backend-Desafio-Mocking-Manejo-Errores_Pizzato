const CartModel = require("./models/cart.model")

class CartDAO {
     
    getCarts = async () => {
        try {
            const carts = await CartModel.find()
            return carts.map(d => d.toObject())
        }
        catch (err) {
            return []
        }
    }

    getCartByCId = async (cid) => {
        try {            
            const cart = await CartModel.findOne({ _id: cid }).populate('products._id')            
            return cart?.toObject() ?? false
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    addCart = async (products) => {
        let nuevoCarrito = await CartModel.create({           
            products
        })
        return nuevoCarrito?.toObject() ?? null
    }

    addProductToCart = async (cid, pid, quantity) => {
        const cart = await this.getCartByCId(cid)
        if (!cart) cart = this.addCart([])        
        const listadoProducts = cart.products;
        const codeProduIndex = listadoProducts.findIndex(elem => elem._id._id.toString() === pid);
        if (codeProduIndex === -1) {
            let productoNuevo = {
                _id: pid,
                quantity: quantity
            }
            listadoProducts.push(productoNuevo);
        } else {
            listadoProducts[codeProduIndex].quantity += quantity;
        }
        await CartModel.updateOne({ _id: cid }, cart)
    }

    updateCartProducts = async (cid, products) => {
        //obtengo el carrito
        const cart = await this.getCartByCId(cid)
        if (!cart) return false
        cart.products = products
        await CartModel.updateOne({ _id: cid }, cart)
    }

    deleteCart = async (cid) => {
        await CartModel.deleteOne({ _id: cid });
    }

    deleteProductToCart = async (cid, pid) => {
        //obtengo el carrito
        const cart = await this.getCartByCId(cid)
        if (!cart) return false
        //obtengo los productos del carrito        
        const productsFromCart = cart.products
        const productIndex = productsFromCart.findIndex(item => item._id.toString() === pid)
        if (productIndex != -1) {
            //existe el producto en el carrito, puedo eliminarlo
            productsFromCart.splice(productIndex, 1)
            await CartModel.updateOne({ _id: cid }, cart)
            return true
        }
        else {
            // no existe el producto en el carito
            return false
        }
    }

    // deleteAllProductCart = async (cid) => {
    //     //obtengo el carrito
    //     const cart = await this.getCartByCId(cid)
    //     if (!cart) return false
    //     cart.products = []
    //     await CartModel.updateOne({ _id: cid }, cart)
    // }
}

module.exports = { CartDAO } 