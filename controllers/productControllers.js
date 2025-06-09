const Product = require('../models/Products');
const Category = require('../models/category');
const Subcategory = require('../models/Subcategory');

exports.createProduct = async(req,res) =>{
    try{
        const{name,description, price, stock, category,subcategory} = req.body;

        //validacion de campos requeridos
        if(!name || !description || !price || !stock || !category || !subcategory){
            return res.status(404).json({
                success: false,
                message:'todos los campos son obligatorios'
            });
        }
        //verificar que la categoria exista
        const categoryExist = await Category.findById(category);
        if(!categoryExist){
            return res.status(404).json({
                success: false,
                message:'la categoria especifica no existe'
            });
        }

        // verificar que las subcategoria existe y pertenece a la categoria

        const subcategoryExists = await Subcategory.findOne({
            _id:subcategory,
            category:category
        });

        if(!subcategoryExists){
            return res.status(400).json({
                success:false,
                message:'la subcategoria no existe o no pertenecea a la categoria especifica'
            });
        }
        //crear el producto sin createBy temporalmente

        const product = new Product({
            name,
            price,
            description,
            stock,
            category,
            subcategory
            // CreateBy se agregara despues de verificar el usuario
        });

        //verificar si el usuario esya disponible en el request
        if(req.user && req.user.id){
            product.CreatedBy = req.user.id;

        }
        //guardar en la base de dattos

        const savedProduct = await product.save();

        //Obtener el producto con los datos poblados

        const productWithDetails = await Product.findById(savedProduct._id)
        .populate('category', 'name')
        .populate('subcategory','name');

        res.status(201).json({
            success:true,
            message:('producto creado exitosamente'),
            data: productWithDetails

        });
    }catch(error){
        console.error('Error en createdProduct:',error);

        //manejo de errores en mongoDB
        if(error.code === 11000){
            return res.status(400).json({
                success:false,
                message:'ya existe un producto con ese nombre'
            });
        }
        res.status(500).json({
            success:false,
            message:'Error al crear el producto',
            error: error.message
        });
    }
};

//consulta de productos GET api/products
exports.getProducts = async (req,res) =>{
    try{
        const products = await Product.find()
        .populate('category','name')
        .populate('subcategory','name')
        .sort({createAt: -1 });

        res.status(200).json({
            success:true,
            const: products.length,
            data:products
        })
    }catch (error){
        console.error('Error en el getProducts',error)
            res.status(500).json({
                success:false,
                message:'Error al obtener los productos'
            });
        
    }
};

exports.getProductById = async (res,req) =>{
    try{
        const product = await Product.findById(req.params.id)
        .populate('category','name description')
        .populate('subcategory','name description') ;

        if(!product){
            return res.status(404).json({
                success:false,
                message:'Producto no encontrado'
            });
        }

        res.status(200).json({
            success:true,
            data: product
        });
    } catch(error){
        console.error('Error en getProductById', error);
        res.status(500).json({
            success:false,
            message:'Error al obtener el producto'

        });
    }
};

exports.updateProduct = async (req,res) =>{
    try{
        const {name, description, price,stock,category,subcategory} = req.body;
        const updateData = {};

        //Validar y preparar datos para actualizacion
        if(name) updateData.name= name;
        if(description) updateData.description = description;
        if(price) updateData.price = price;
        if(stock) updateData.stock = stock;

        //validar relaciones si se actualizan
        if(category || subcategory){
            if(category){
                const categoryExist = await Category.findById(category);
                if(!categoryExist){
                    return res.status(404).json({
                        success:false,
                        message:'la categoria especifica no existe'
                    });
                }
                updateData.category = category;
            }
            if(subcategory){
                const subcategoryExists = await Subcategory.findOne({
                    _id:subcategory,
                    category:category || updateData.category
                });

                if(!subcategoryExists){
                    return res.status(400).json({
                        success:false,
                        message:'esta subcategoria no existe o no pertenece a la categoria '
                    });
                }
                updateData.subcategory = subcategory;
                
            }
         }
        //actualizar el producto
        const updatedProduct = await Product.findByAndUpdate(
            req.params.id,
            updateData,{
                new:true,
                runValidatos: true

            }
        )
        .populate('category', 'name')
        .populate('subcatgory','name');
        
        if(!this.updatedProduct){
            return res.status(404).json({
                success:false,
                message:'Producto no encontrado'
            });
        }

        res.status(200).json({
            success:true,
            message:'Producto actualizado exitosamente',
            data: updatedProduct
        });
    } catch(error){
        console.error('Error en updateProduct',error);
        res.status(500).json({
            success:false,
            message:'Error en actualizar el producto'
        });
    }
};

exports.deleteProduct = async (req,res) =>{
    try{
        const product = await Product.findByIdAndDelete(req.params.id);

        if(!product){
            return res.status(404).json({
                success:false,
                menssage:'Producto no encontrado'
            });
        }

        res.status(200).json({
            success:true,
            message:'Producto eliminado correctamente',
            data: product
        });
    }catch(error){
        console.error('Error en deleteProduct',error);
        res.status(500).json({
            success:false,
            message:'Error al eliminar el producto'

        });
    }
    
};