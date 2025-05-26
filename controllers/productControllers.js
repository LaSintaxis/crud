const Product = require('../models/Product')
const Category = require('../models/category')
const subcategory = require('../models/Subcategory');
const Subcategory = require('../models/Subcategory');

exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, subcategory } = req.body;

        //validacion de campos requeridos
        if (!name || !description || !price || !stock || !category || !subcategory) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son obligatorios'
            })
        }

        //Verificar que la categoria exista
        const categoryExists = await Category.findById(category)
        if (!categoryExists) {
            return res.status(404).json({
                success: false,
                message: 'la categoria especifica no existe'
            })
        }

        //verifica que la subcategoria existe y pertenece a la categoria
        const subcategoryExists = await Subcategory.findOne({
            _id: subcategory,
            category: category
        })

        if (!subcategoryExists) {
            return res.status(400).json({
                success: false,
                message: 'La subcategoria no existe o no pertenece a la categoria especifica'
            })
        }

        //crear el producto sin el createBy temporalmente
        const product = new Product({
            name,
            description,
            price,
            stock,
            category,
            subcategory
            // CreatedBy se agregara despues de verificar el usuario
        })

        ///Verificar si el usuario esta disponible en el request
        if (req.user && req.user.id) {
            product.createdBy = req.user.id;
        }

        //Guardar en la base de datos
        const savedProduct = await product.save();

        //Obtener el producto con los datos poblados
        const productWithDetails = await Product.findById(savedProduct._id)
            .populate('category', 'name')
            .populate('subcategory', 'name');

        res.status(201).json({
            success: true,
            message: ('producto creado exitosamente'),
            data: productWithDetails
        })
    } catch (error) {
        console.error('error en createdProduct: ', error)

        //manejo de errores en mongodb
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un producto con ese nombre'
            })
        }
        res.status(500).json({
            success: false,
            message: 'Error al crear el producto',
            error: error.message
        })
    }

}

//Consulta de productos GET api/products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category', 'name')
            .populate('subcategory', 'name')
            .sort({ createAt: -1 });

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        })
    } catch (error) {
        console.error('Error de getProducts', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos'
        })
    }
}


exports.getProductsById = async (res, req) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name description')
            .populate('subcategory', 'name description')

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'producto no encontrado'
            })
        }

        res.status(200).json({
            success: true,
            data: product
        })
    } catch (error) {
        console.error('error en getProductById', error);
        res.status(500).json({
            success: false,
            message: 'Errpr al obtener el producto'
        });
    };
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category, subcategory } = req.body;
        const updateData = {};

        //Validar y preparar datos para act
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = price;
        if (stock) updateData.stock = stock;

        //validar relaciones
        if (category || subcategory) {
            if (category) {
                const categoryExists = await Category.findById(category);
                if (!categoryExists) {
                    return res.status(404).json({
                        success: false,
                        message: 'La categoria especifica no existe'
                    })
                }

                updateData.category = category;
            }

            if (subcategory) {
                const subcategoryExists = await Subcategory.findOne({
                    _id: subcategory,
                    category: category || updateData.category
                })

                if (!subcategoryExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'La subcategoria no existe o no pertenece a la categoria'
                    })
                }
                updateData.subcategory = subcategory
            }
        }

        //Actualizar el producto
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        )
            .populate('category', 'name')
            .populate('subcategory', 'name')

            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                })
            }
            res.status(200).json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: updatedProduct
            });
    } catch (error) {
        console.error('Error en updatedProduct')


    }
}

exports.deleteProduct = async (req, res) => {
    try{
        const product = await Product.findByIdAndDelete(req.params.id);
        if(!product){
            return res.status(404).json({
                success:false,
                message: 'Producto no encontrado'       
            })
        }

        res.status(200).json({
            success:true,
            message: ' Producto eliminado exitosamente',
            data: product
        })
    }catch(error){
        console.error('Error en deleteProduct: ',error);
        res.status(500).json({
            success:false,
            message:'Error al eliminat el producto'
        })
    }
}