const { ProductDAO } = require("./mongo/product.dao");
const { CartDAO } = require("./mongo/cart.dao");
const { UserDAO } = require("./mongo/user.dao");

module.exports = {
    Product: ProductDAO,
    Cart: CartDAO,
    User: UserDAO
}