const { ProductDTO } = require("./product.dto")

class CartDTO {

    constructor(cart) {
        this.id = cart._id.toString()
        this.products = cart.products.map(prod => new ProductDTO(prod))
        //console.log(this.products)
    }
}

module.exports = { CartDTO }