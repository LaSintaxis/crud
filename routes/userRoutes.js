const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { verifyToken } = require('../middlewares/authJwt')
const { checkRole } = require('../middlewares/role')

//
router.use((req, res, next) => {
    console.log('\n=== DIAGNOSTICO DE RUTA ===');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers: ', {
        'authorization: ': req.headers.authorization ? '***' + req.headers.authorization.slice(8) : null,
        'x-access-token': req.headers['x-access-token'] ? '***' + req.headers['x-access-token'].slice(-8) : null,
        'user-agent': req.headers['user-agent']
    })
    next()
})

//GET /api/user - listar usuarios (admin, coordinador pueden ver todos, auxiliar solo se ve a si mismo)
router.get('/',
    verifyToken,
    checkRole('admin', 'coordinador', 'auxiliar'),
    userController.getAllUsers
)

//POST /API/USERS crear usuario solo (admin)
router.post('/',
    verifyToken,
    checkRole('admin'),
    userController.createUser
)

//GET /api/users/:id - obtener usuario especifico (admin y coordinador pueden ver cualquiera, auxiliar solo se ve a si mismo)
router.get('/:id',
    verifyToken,
    checkRole('admin','coordinador','auxiliar'),
    userController.getUserById
)


//PUT /api/users/:id - actualizar usuario (admin y coordinador pueden actualizar)
router.put('/:id',
    verifyToken,
    checkRole('admin','coordinador'),
    userController.updateUser
)

// DELETE /api/users/:id - eliminar usuario (solo admin)
router.delete('/:id',
    verifyToken,
    checkRole('admin'),
    userController.deleteUser
)

module.exports = router;

