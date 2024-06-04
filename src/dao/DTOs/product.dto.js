class ProductDTO {

    constructor(product) {
        this.id = product._id.toString()
        this.quantity = product.quantity
        this.title = product.title              
        this.description = product.description
        this.price = product.price 
        this.thumbnail = product.thumbnail
        this.code = product.code
        this.stock = product.stock        
        this.category = product.category                    
    }
}

module.exports = { ProductDTO }