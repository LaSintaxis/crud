const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');
const { check } = require('express-validator');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

//validaciones
const validateSubcategory = [
    check('name').not().isEmpty().withMessage('El nombre es obligatorio'),
    check('description').not().isEmpty().withMessage('La descripcion es obligatoria'),
    check('category').not().isEmpty().withMessage('la categoria es obligatoria')
];


/***RUTAS****/
//POST /api/subcategories solo admin y coordinador pueden crear subcategoria
router.post('/',
    verifyToken,
    checkRole('admin', 'coordinador'),
    validateSubcategory, subcategoryController.createSubcategory
);

// GET /api/subcategories - los 3 roles las pueden consultar
router.get('/', 
    verifyToken,
    checkRole('admin', 'coordinador', 'auxiliar'),
    subcategoryController.getSubcategories
);

router.get('/:id', 
    verifyToken,
    checkRole('admin', 'coordinador', 'auxiliar'),
    subcategoryController.getSubcategoryById);

// PUT /api/subcategories - Actualizar subcategoria por id (solo admin y coordinador )
router.put('/:id',
    verifyToken,
    checkRole('admin', 'coordinador'),
    validateSubcategory, subcategoryController.updateSubcategory
);

// DELETE /api/subcategories - eliminar subcategoria por id (solo admin)
router.delete('/:id',
    verifyToken,
    checkRole('admin'),
    subcategoryController.deleteSubcategory
);

module.exports = router;
