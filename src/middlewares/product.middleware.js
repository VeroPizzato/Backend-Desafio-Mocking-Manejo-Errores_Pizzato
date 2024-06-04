// const { ProductsStorage } = require('../persistence/products.storage')
const { Product } = require('../dao')

const { ProductsService } = require('../services/products.service')

const productDAO = new Product()
const productsService = new ProductsService(productDAO)

const soloNumYletras = (code) => {
    return (/^[a-z A-Z 0-9]+$/.test(code))
}

const soloNumPositivos = (code) => {
    return (/^[0-9]+$/.test(code) && (code > 0))
}

const soloNumPositivosYcero = (code) => {
    return (/^[0-9]+$/.test(code) && (code >= 0))
}

// Middleware para validacion de datos al agregar un producto 
const validarNuevoProducto = async (req, res, next) => {
    try {       
        const product = req.body
        product.price = +product.price
        product.stock = +product.stock
        product.thumbnail = [product.thumbnail]
        var boolStatus = JSON.parse(product.status)

        if (!product.title || !product.description || !product.price || !product.code || !product.stock || !product.category) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios, salvo la ruta de la imagen' })
        }
        if (isNaN(product.price) || isNaN(product.stock)) {
            res.status(400).json({ error: "Invalid number format" })
            return
        }
        if (!soloNumPositivos(product.price)) {
            res.status(400).json({ error: "Precio negativo" })
            return
        }
        if (!soloNumPositivosYcero(product.stock)) {
            res.status(400).json({ error: "Stock negativo" })
            return
        }
        if (!Array.isArray(product.thumbnail)) {
            res.status(400).json({ error: "El campo thumbnail es invalido." })
            return
        }
        else {
            let rutasValidas = true
            product.thumbnail.forEach(ruta => {
                if (typeof ruta != "string") {
                    rutasValidas = false
                    return
                }
            })
            if (!rutasValidas) {
                res.status(400).json({ error: "El campo thumbnail es invalido." })
                return
            }
        }
        const listadoProductos = await productsService.getProducts(req.query)
        const codeIndex = listadoProductos.docs.findIndex(e => e.code === product.code)
        if (codeIndex !== -1) {
            res.status(400).json({ error: "Codigo ya existente" })
            return
        }
        if (!soloNumYletras(product.code)) {
            res.status(400).json({ error: "El campo codigo identificador es invalido." })
            return
        }
        if (typeof boolStatus != "boolean") {
            res.status(400).json({ error: "El campo status es invalido." })
            return
        }
        next()
    }
    catch {
        return res.status(400).json({ error: "Producto nuevo invalido." })
    }
}

// Middleware para validacion de datos al actualizar un producto 
// Si algun dato es vacio no se actualiza
const validarProdActualizado = async (req, res, next) => {
    try {        
        const { title, description, price, thumbnail, code, stock, status, category } = req.body
        let idProd = req.params.pid

        const listadoProductos = await productsService.getProducts(req.query)
        const codeIndex = listadoProductos.docs.findIndex(e => e._id.toString() === idProd)
        if (codeIndex === -1) {
            res.status(400).json({ error: "Producto con ID:" + idProd + " not Found" })
            return
        }
        else {
            if (price !== '') {
                if (isNaN(price)) {
                    res.status(400).json({ error: "Error. El campo precio es invalido." })
                    return
                }
                if (!soloNumPositivos(price)) {
                    res.status(400).json({ error: "Precio negativo" })
                    return
                }
            }
            if (stock !== '') {
                if (isNaN(stock)) {
                    res.status(400).json({ error: "El campo stock es invalido." })
                    return
                }
                if (!soloNumPositivosYcero(stock)) {
                    res.status(400).json({ error: "Precio negativo" })
                    return
                }
            }
            if (!Array.isArray(thumbnail)) {
                res.status(400).json({ error: "El campo thumbnail es invalido." })
                return
            }
            else {
                let rutasValidas = true
                thumbnail.forEach(ruta => {
                    if (typeof ruta != "string") {
                        rutasValidas = false
                        return
                    }
                })
                if (!rutasValidas) {
                    res.status(400).json({ error: "El campo thumbnail es invalido." })
                    return
                }
            }
            if (code !== '') {
                if (!soloNumYletras(code)) {
                    res.status(400).json({ error: "El campo codigo identificador es invalido." })
                    return
                }
            }
            if (typeof status != "boolean") {
                return res.status(400).json({ error: "El campo status es invalido." })
            }
        }
        next()
    }
    catch {
        return res.status(400).json({ error: "No existe el producto a actualizar." })
    }
}

// Middleware para validacion de datos de un producto 
const validarProductoExistente = async (req, res, next) => {
    try {       
        let prodId = req.params.pid
        // if (isNaN(prodId)) {
        //     res.status(400).json({ error: "Formato invalido." })
        //     return
        // }
        const producto = await productsService.getProductById(prodId)
        if (!producto) {
            return producto === false
                ? res.status({ message: 'Not found!' }, 404)
                : res.status({ message: 'Something went wrong!' })
        }
        next()
    }
    catch {
        return res.status(400).json({ error: "No existe el producto." })
    }
}

module.exports = { validarNuevoProducto, validarProdActualizado, validarProductoExistente }  