const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config/auth.config')

//Roles del sistema
const ROLES = {
    ADMIN: 'admin',
    COORDINADOR: 'coordinador',
    AUXILIAR: 'auxiliar'
}

//funcion para verificar permisos
const checkPermission = (UserRole, allowedRoles) => {
    return allowedRoles.includes(UserRole);
}

// 1. registro de usuarios (SOLO ADMIN)
exports.signup = async (req, res) => {
    try{
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password:bcrypt.hashSync(req.body.password,8),
            role: req.body.role || 'auxiliar' //usamos el valor directo 
        });

        const savedUser = await user.save();

        const token = jwt.sign({ id:savedUser._id}, config.secret,{

        })

        res.status(200).json({
            success: true,
            message: 'Usuario registrado correctamente',
            token: token,
            user: savedUser
        })
    } catch(error){
        res.status(500).json({
            success:false,
            message: 'error al registrar usuario',
            error: error.message
        })
    }
}

// 2. Login (Comun para todos)
exports.signin = async (req, res) => {
    try{
        console.log('[AuthController] Body recibido: ',req.body)

        //1. Validacion de campos requeridos 
        if ((!req.body.username && !req.body.email) || !req.body.password) {
            console.log('[AuthController] campos faltantes', {
                username: req.body.username,
                email: req.body.email,
                password: req.body.password ? '***' : 'NO PROVISTO'
            })
            return res.status(400).json({
                success: false,
                message: 'Se requiere email/username/password'
            })
        }

        //Buscar usuario con todos los campos necesarios
        const user = await User.findOne({
            $or: [
                {username: req.body.username},
                {email: req.body.email}
            ]
        }).select('+password')  // asegurar que traiga el campo de password

        if(!user) {
            console.log('[AuthController] usuario no encontrado');
            return res.status(400).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        // 3. validar que el usuario tenga contraseña
        if (!user.password){
            console.log('[AuthController] usuario sin contraseña registrada');
            return res.status(500).json({
                success: false,
                message: 'Error en la configuracion del usuario'
            })
        }
    } catch(error){
        
    }
}