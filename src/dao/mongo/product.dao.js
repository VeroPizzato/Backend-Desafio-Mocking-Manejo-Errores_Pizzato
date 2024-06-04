const ProductModel = require("./models/products.model")

class ProductDAO {
    
    getProducts = async (filters) => {
        try {
            let filteredProducts = await ProductModel.find()

            if (JSON.stringify(filters) === '{}') {  // vienen vacios los filtros            
                filteredProducts = await ProductModel.paginate({}, { limit: filteredProducts.length })
                return filteredProducts
            }

            // busqueda general, sin filtros, solo esta avanzando o retrocediendo por las paginas
            let { page, ...restOfFilters } = filters

            if (page && JSON.stringify(restOfFilters) === '{}') {
                filteredProducts = await ProductModel.paginate({}, { page: page, lean: true })
                // return filteredProducts.docs.map(d => d.toObject())
                return filteredProducts
            }

            if (!page) page = 1
            const { limit, category, availability, sort } = { limit: 10, page: page, availability: 1, sort: 'asc', ...filters }

            if (availability == 1) {
                if (category)
                    filteredProducts = await ProductModel.paginate({ category: category, stock: { $gt: 0 } }, { limit: limit, page: page, sort: { price: sort }, lean: true })
                else
                    filteredProducts = await ProductModel.paginate({ stock: { $gt: 0 } }, { limit: limit, page: page, sort: { price: sort }, lean: true })
            }
            else {
                if (category)
                    filteredProducts = await ProductModel.paginate({ category: category, stock: 0 }, { limit: limit, page: page, sort: { price: sort }, lean: true })
                else
                    filteredProducts = await ProductModel.paginate({ stock: 0 }, { limit: limit, page: page, sort: { price: sort }, lean: true })
            }

            return filteredProducts
            // return filteredProducts.map(d => d.toObject())
        }
        catch (err) {
            return []
        }
    }

    getProductById = async (idProd) => {
        try {
            const producto = await ProductModel.findOne({ _id: idProd })
            return producto?.toObject() ?? false
        }
        catch (err) {
            console.error(err)
            return null
        }
    }
  

    addProduct = async (title, description, price, thumbnail, code, stock, status, category) => {
        let product = await ProductModel.create({            
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            status,
            category
        })
    }

    updateProduct = async (prodId, producto) => {
        await ProductModel.updateOne({ _id: prodId }, producto)
    }

    deleteProduct = async (idProd) => {
        await ProductModel.deleteOne({ _id: idProd })
    }

}

module.exports = { ProductDAO } 