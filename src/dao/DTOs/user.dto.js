class UserDTO {

    constructor(user) {
        this.id = user._id.toString()
        this.first_name = user.first_name
        this.last_name = user.last_name
        this.age = user.age
        this.email= user.email    
        this.cart = user.cart
        this.rol = user.rol
    }
}

module.exports = { UserDTO }