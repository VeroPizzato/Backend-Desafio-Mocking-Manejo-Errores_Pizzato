const { fakerES: faker } = require("@faker-js/faker")

const generateUser = () => ({
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    age: faker.number.int({min:0, max:100}),
    email: faker.internet.email(),
    password: faker.internet.password(),
    rol: faker.person.jobDescriptor(),
    cart: []
})

module.exports = { generateUser }