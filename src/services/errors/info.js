// Funciones que generan un error descriptivo para el usuario
const generateProductErrorInfo = (product) => {
    return `Una de las propiedades del producto no es válida
    Lista de Propiedades:
    * title : debe ser un string, se recibió ${product.title}
    * description : debe ser un string, se recibió ${product.description}
    * price : debe ser un número, se recibió ${product.price}
    * category : debe ser un string del tipo computación, se recibió ${product.category}
    * status : debe ser un booleano, se recibió ${product.status}
    * thumbnail : debe ser un string, se recibió ${product.thumbnail}
    * code : debe ser un string, se recibió ${product.code}
    * stock : debe ser un número, se recibió ${product.stock}`
}

module.exports = { generateProductErrorInfo }