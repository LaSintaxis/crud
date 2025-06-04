const jwt = require('jsonwebtoken')
const config = require('../config/auth.config')
const { User } = require('../models/User')

console.log('[AuthJWT] Configuracion cargada: ', config.secret ? '***' + config.secret.slice(-5) : 'NO CONFIGURADO');

//definicion del middleware
const verifyTokenFn = (req, res, next) => {
    console.log('\n[AuthJWT] middleware ejecutandose para: ', req.originalUrl)

    try {
        const token = req.headers['x-access-token'] || req.headers.autorization?.split('')[1];
        console.log('[AuthJWT] token recibido: ', token ? '***' + token.slice(-8) : 'NO PROVISTO')

        if (!token) {
            console.log('[AuthJWT] error: token no proporcionado')
            return res.status(403).json({
                success: false,
                message: 'Token no proporcionado'
            })
        }

        const decoded = jwt.verify(token, config.secret);
        req.userId = decoded.id;
        req.userRole = decoded.role;
        console.log('[AuthJWT] token valido para: ', decoded.email)
        next();
    } catch (error) {
        console.error('[AuthJWT] error: ', error.name, '_', error.message);
        return res.status(401).json({
            success: false,
            message: 'Token invalido',
            error: error.name
        });
    };
};

const AuthJWT = (req, res, next) => {
    const token = req.headers.autorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            message: 'token no proporcionado'
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next()
    } catch (error) {
        return res.status(401).json({
            message: 'token invalido'
        })
    }
}

//Validacion antes de exportar 
if ( typeof verifyTokenFn !== 'function') {
    console.error('[AuthJWT] Error: verifyTokenFn no es una funcion')
    throw new Error('verifyTokenFn debe ser una funcion ')
}

console.log('[AuthJWT] Middleware verifyTokenFn es una funcion: ',typeof verifyTokenFn);

module.exports = {
    verifyToken: verifyTokenFn
}