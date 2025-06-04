const User = require('../models/User')
const bcrypt = require('bcryptjs')

//Obtener todos los usuarios (Solo Admin)
exports.getAllUsers = async (req, res) => {
    console.log('[CONTROLLER] Ejecutanto getAllUsers')//diagnostico
    try{
        const users = await User.find().select('password');
        console.log('[CONTROLLER] Usuarios encontrados: ', users.length)//diagnostico
        res.status(200).json({
            success: true,
            data: users
        })
    } catch (error){
        console.error('[CONTROLLER] Error en getAllUsers: ',error.message); //diagnostico
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        })
    }
}

//obtener usuario especifico
exports.getUserById = async (res,req) => {
    try{
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success:false,
                message: 'Usuario no encontrado'
            })
        }

        //Validaciones de acceso
        if (req.user.role === 'auxiliar' && req.user.id !== user.id.toString()){
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver este usuario'
            })
        }

        if (req.user.role === 'coordinador' && user.role === 'admin'){
            return res.status(403).json({
                success:false,
                message: 'NOO puedes ver usuarios admin'
            })
        }

        res.status(200).json({
            success: true, 
            user
        })
    } catch (error){
        res.status(500).json({
            success:false,
            message: 'Error al obtener usuario',
            error: error.message
        })
    }
}

//crear usuario (Admin y coordinador)
exports.createUser = async (req, res) => {
    try{
        const { username, email, password, role } = req.body;

        const user =new User({
            username,
            email,
            password: await bcrypt.hash(password, 10),
            role
        })

        const savedUser = await user.save()

        res.status(201).json({
            success:true,
            message: 'Usuario creado',
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email:savedUser.email,
                role: savedUser.role
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario',
            error: error.message
        })
    }
}

//actualizar usuario (admin y coordinador)
exports.updateUser = async (req, res) => {
    try{
        const updatedUser = await User.findByIdAndUpdate(req.params.id,
            { $set:req.body},
            {new: true}
        ).select('-password');
        if (!updatedUser){
            return res.status(404).json({
                success:false,
                message: 'usuario no encontrado'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado correctamente',
            user: updatedUser
        })

    } catch (error){
        res.status(500).json({
            success:false,
            message: 'Error al actualizar usuario',
            error: error.message
        })
    }
}

// Eliminar usuario (solo Admin)
exports.deleteUser = async (res, req) => {
    console.log('[CONTROLLER] Ejecutando deleteUser para ID: ',req.params.id) //diagnostico
    
    try{
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if(!deletedUser){
            console.log('[CONTROLLER] Usuario no encontrado para eliminar') //diagnostico
            return res.status(404).json({
                success:false,
                message: 'usuario no encontrado'
            })
        }

        console.log('[CONTROLLER] Usuario eliminado: ',deletedUser._id)//diagnostico
        res.status(200).json({
            success:true,
            message: 'Usuario eliminado correctamente'
        })
    } catch (error) {
        console.error('[CONTROLLER] Error al eliminar usuario: ',error.message)//diagnostico
        res.status(500).json({
            success: false,
            message: 'error al eliminar usuario'
        })
    }
}