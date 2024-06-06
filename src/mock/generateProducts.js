const { fakerES: faker } = require("@faker-js/faker")

const generateProduct = () => ({
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price(),
    thumbnail: [faker.image.url()],   
    code: faker.string.alphanumeric(),
    stock: faker.number.int({ min: 0, max: 200 }),
    status: faker.datatype.boolean(),
    category: faker.commerce.product()
})

module.exports = { generateProduct }