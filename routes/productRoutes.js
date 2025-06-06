const express = require('express');
const productController = require('../controllers/productControllers');
const router = express.Router();
const {check} = require('express-validator');

const validateProduct = [

    check('name').not().isEmpty().withMessage('el nombre es obligatorio'),
    check('description').not().isEmpty().withMessage('la descripcion es obligatorio'),
    check('price').isFloat({min:0}).isEmpty().withMessage('el precio es obligatorio'),
    check('stock').isInt({min:0}).withMessage('stock invalido'),
    check('category').not().isEmpty().withMessage('la categoria es requerida'),
    check('subcategory').not().isEmpty().withMessage('la subcategoria es requerida'),

];
router.post('/', validateProduct, productController.createProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.put('/:id',validateProduct, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;

    



