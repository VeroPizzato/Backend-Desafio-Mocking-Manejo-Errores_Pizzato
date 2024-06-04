const dotenv = require('dotenv')

dotenv.config()

module.exports = {
    MONGO_URL: process.env.MONGO_URL,
    DB_NAME: process.env.DB_NAME,   
    SECRET: process.env.SECRET,  
    PORT: process.env.PORT,
    APP_ID: process.env.APP_ID,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    CALLBACK_URL: process.env.CALLBACK_URL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD 
}