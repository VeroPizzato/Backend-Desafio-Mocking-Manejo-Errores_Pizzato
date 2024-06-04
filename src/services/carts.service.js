class CartsService {

    constructor(dao) {
        this.dao = dao
    }

    async getCarts () {
        return await this.dao.getCarts()
    }

    async getCartByCId (cid) {
        return await this.dao.getCartByCId(cid)
    }

    async addCart (products) {
        await this.dao.addCart(products)
    }

    async addProductToCart (cartId, prodId, quantity) {        
        await this.dao.addProductToCart(cartId, prodId, quantity);       
    }

    async updateCartProducts (cartId, products) {  
        await this.dao.updateCartProducts(cartId, products)
    }   

    async deleteCart (cid) {
        await this.dao.deleteCart(cid)
    }

    async deleteProductToCart (cartId, prodId) {
        return await this.dao.deleteProductToCart(cartId, prodId)
    }

    // async deleteAllProductCart (cartId) {
    //     return await this.dao.deleteAllProductCart(cartId)
    // }
}

module.exports = { CartsService }