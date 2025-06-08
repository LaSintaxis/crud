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

//rutas

//POST /api/subcategories solo admin y coordinador pueden crear subcategoria
router.post('/',
    verifyToken,
    checkRole('admin', 'coordinador'),
    validateSubcategory, subcategoryController.createSubcategory
);
router.get('/', subcategoryController.getSubcategories);
router.get('/:id', subcategoryController.getSubcategoryById);
router.put('/:id', validateSubcategory, subcategoryController.updateSubcategory);
router.put('/:id', subcategoryController.deleteSubcategory);

module.exports = router;
