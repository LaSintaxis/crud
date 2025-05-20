const Category = require('../models/Category')

exports.createCategory = async (req, res) => {
    try{
        const { name, description } = req.body;
    
        //validacion
        if(!name || typeof name !== 'string' || !name.trim()){
            return res.status(400).json({
                success:false,
                message: 'El nombre es obligatorio y debe ser valido'
            })
        }
        if(!description || typeof description !== 'string' || !description.trim()){
            return res.status(400).json({
                success: false,
                message: 'La descripcion es obligatoria y debe ser texto valido'
            })
        }
        const trimmedName = name.trim();
        const trimmedDesc = description.trim()

        //Verificar si ya existe la categoria
        const existingCategory = await Category.findOne({name: trimmedName});
    }
}