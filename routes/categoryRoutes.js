const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken } = require('../middlewares/authJwt');
const { checkRole } = require('../middlewares/role');

// POST /api/categories - Crear categoria (admin y coordinador)
router.post('/',
    verifyToken,
    checkRole('admin', 'coordinador'),
    categoryController.createCategory
);

// GET /api/categories - listar las categorias
router.get('/',
    verifyToken,
    checkRole('admin', 'coordinador', 'auxiliar'),
    categoryController.getCategories
);

//GET /api/categories - obtener categoria especifica
router.get('/:id',
    verifyToken,
    checkRole('admin', 'coordinador', 'auxiliar'),
    categoryController.getCategoryById
);

// PUT /api/categories - modificar categoria especifica (admin y coordinador)
router.put('/:id',
    verifyToken,
    checkRole('admin', 'coordinador'),
    categoryController.updateCategory
);

// DELETE /api/categories - eliminar categoria especifica (solo admin)
router.delete('/:id',
    verifyToken,
    checkRole('admin'),
    categoryController.deleteCategory
);

module.exports = router;