const User = require('../models/User');
const bcrypt = require('bcryptjs');

//Obtener todos los usuarios (admin y coordinador)
exports.getAllUsers = async (req, res) => {
    console.log('[CONTROLLER] Ejecutando getAllUsers');
    try {
        const users = await User.find().select('-password');
        console.log('[CONTROLLER] Usuarios encontrados:', users.length);
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('[CONTROLLER] error en getAllUsers:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios'
        });
    }
};


//Obtener usuario especifico
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'usuario no encontrado'
            });
        }

        // validaciones de acceso
        if (req.userRole === 'auxiliar' && req.userId !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver este usuario'
            });
        }

        if (req.userRole === 'coordinador' && user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'NO puedes ver usuarios admin'
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuario',
            error: error.message
        });
    }
};


//crear usuario (admin y coordinador)
exports.createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        const user = new User({
            username,
            email,
            password: await bcrypt.hash(password, 10),
            role
        });

        const savedUser = await user.save();

        res.status(201).json({
            success: true,
            message: 'usuario creado exitosamente',
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role
            }

        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'error al crear usuario',
            error: error.message
        });
    }
};

//actualizar usuario (admin y Coordinador)
exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado correctamente',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'error al actualizar usuario',
            error: error.message
        });
    }
};

//Eliminar usuario(solo admin)
exports.deleteUser = async (req, res) => {
    console.log('[CONTROLLER] Ejecutando deleteUser para Id:', req.params.id);//diagnostico
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            console.log('[CONTROLLER] usuario no encontrado para eliminar');//Diagnostico
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log('[CONTROLLER] usuario eliminado ', deletedUser._id); //diagonostico
        res.status(200).json({
            success: true,
            message: 'usuario eliminado correctamente'
        });
    } catch (error) {
        console.error('[CONTROLLER ] error al eliminar usuario', error.message);//diagonostico
        res.status(500).json({
            success: false,
            message: 'error al eliminar usuario'
        });
    }
};