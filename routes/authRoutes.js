const express = require('express')
const router = express.Router()
const  authController = require('../controllers/authControllers')
const {verifySignUp} = require('../middlewares/verifySignUp')

//importacion de verificacion 
let verifyToken;
try {
    const authJwt = require('../middlewares/authJwt')
    verifyToken = authJwt.verifyToken;
    console.log('[AuthRoutes] verifyToken importado correctamente ',typeof verifyToken)
} catch (error){
    console.error('[AuthRoutes] ERROR al importar verifyToken: ',error)
    throw error
}

////middleware de diagnostico 
router.use((req,res,next) => {
    console.log('\n[AuthRoutes] Peticion recibida:',{
        method: req.method,
        path: req.path,
        Headers: {
            authorization: req.headers.authorization ? '***' : 'NO',
            'x-access-token': req.headers
            ['x-access-token'] ? '***' : 'NO'
        }
    })
    next();
})

//Rutas de login (sin proteccion)
router.post('/signin', authController.signin);

//Ruta de registro 
router.post('/signup',
    (req,res,next) => {
        console.log('[AuthRoutes] Middleware de verificacion de registro');
        next()
    },
    verifySignUp.checkDuplicateUsernameOrEmail,
    verifySignUp.checkRolesExisted,
    authController.signup
);

// verificacion final de rutas 
console.log('[AuthRoutes] Rutas configuradas:',router.stack.map(layer => {
    return {
        path: layer.route?.path,
        methods: layer.route?.methods 
    }
}))

module.exports = router