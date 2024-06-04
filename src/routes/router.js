const { Router } = require('express')

class BaseRouter {
    constructor() {
        this.router = Router()
        this.router.param('pid', (req, res, next, value) => {
            const isValid = /^[a-z0-9]+$/.test(value)
            if (!isValid)               
                return res.status(400).send('Invalid param pid')
            req.pid = value
            next()
        })

        this.router.param('cid', (req, res, next, value) => {
            const isValid = /^[a-z0-9]+$/.test(value)            
            if (!isValid)                
                return res.status(400).send('Invalid param cid')
            req.cid = value
            next()
        })
        this.init()
    }
    
    getRouter() {
        return this.router
    }

    init() {
        // implementar este método en las clases hijas
    }

    get(path, ...callbacks) {
        // llamamos al router de express con el path, pero customizamos los callbacks
        this.router.get(path, this.generateCustomResponse, this.customizeCallbacks(callbacks))
    }

    post(path, ...callbacks) {
        // llamamos al router de express con el path, pero customizamos los callbacks
        this.router.post(path, this.generateCustomResponse, this.customizeCallbacks(callbacks))
    }

    put(path, ...callbacks) {
        // llamamos al router de express con el path, pero customizamos los callbacks
        this.router.put(path, this.generateCustomResponse, this.customizeCallbacks(callbacks))
    }

    delete(path, ...callbacks) {
        // llamamos al router de express con el path, pero customizamos los callbacks
        this.router.delete(path, this.generateCustomResponse, this.customizeCallbacks(callbacks))
    }

    generateCustomResponse = (req, res, next) => {
        res.sendSuccess = payload => res.send({status: 'success', payload})
        res.sendServerError = error => res.status(500).send({status: 'error', error})
        res.sendUserError = error => res.status(400).send({status: 'error', error})
        res.sendNotFoundError = error => res.status(404).send({status: 'error', error})
        res.sendCreatedSuccess = error => res.status(201).send({status: 'success', payload})
        res.sendUnauthorized = error => res.status(401).send({status: 'error', error})
        res.sendForbidden = error => res.status(403).send({status: 'error', error})
        next()
    }

    customizeCallbacks(callbacks) {
        // para cada callback, generamos un middleware que lo envuelve en un try/catch
        return callbacks.map(callback => async (...params) => {  // params contiene los parametros de cada middleware
            try {
                // apply es un método de los callbacks que permite llamarlos
                // si en el callback se llegase a utilizar "this", se utilizaría la referencia que le pasamos en el 1er argumento, osea esta clase
                // en el 2do argumento, le pasamos un array de parámetros que usa el callback
                await callback.apply(this, params)
            } catch (err) {   
                // nuestra función flecha es un middleware también, entonces sabemos que params será [req, res, next]
                const [, res,] = params
                res.status(500).send(err)  // params[1].status(500).send(err)
            }
        })
    }
}

module.exports = BaseRouter