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
    try {
        console.log('[AuthController] registro iniciado ', req.body)

        if (!req.body.email || req.body.password) {
            return res.status(400).json({
                success: false,
                message: "email y contraseña son requeridos"
            })
        }

        const user = new User({
            //*username: req.body.username,*/
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || 'auxiliar' //usamos el valor directo 
        });

        const savedUser = await user.save();
        console.log('[AuthController] Usuario registrado ', savedUser.email)

        const token = jwt.sign({ id: savedUser._id }, config.secret, {
            expiresIn: config.jwtExpiration
        })

        const userData = savedUser.toObject();
        delete userData.password;

        res.status(200).json({
            success: true,
            message: 'Usuario registrado correctamente',
            token,
            user: userData
        })
    } catch (error) {
        console.error('[AuthController] error en registro de usuario ', error),
            res.status(500).json({
                success: false,
                message: 'error al registrar usuario',
                error: error.message
            })
    }
}

// 2. Login (Comun para todos)
exports.signin = async (req, res) => {
    try {
        console.log('[AuthController] Login iniciado: ', req.body.email)

        if (!req.body.email || !req.body.password) {
            return res.status(400).json({
                success: false,
                message: 'email y contraseña son requeridos'
            })
        }

        const user = await user.findOne({ email: req.body.email }).select('+password')


        if (!user) {
            console.log('[AuthController] usuario no encontrado');
            return res.status(404).json({
                success: false,
                message: 'usuario no encontrado'
            })
        }

        console.log('[AuthController] comparando contraseña para: ', user.email)
        const isMatch = await user.comparePassword(req.body.password);

        if (!isMatch) {
            console.log('[AuthController] Contraseña no coincide');
            return res.status(401).json({
                success: false,
                message: 'credenciales invalidas'
            })
        }

        // 5. generar token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            config.secret, {
            expiresIn: config.jwtExpiration
        });


        res.status(200).json({
            success: true,
            token,
            user:{
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

//3. obtener todos los usuarios (Admin y coordinador)
exports.getAllUsers = async (req, res) => {
    try {
        //verificar permisos
        if (!checkPermission(req.user.Role, [ROLES.ADMIN, ROLES.COORDINADOR])) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para ver usuarios'
            })
        }

        const users = await User.find({}).select('-password-__v');
        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        })
    } catch (error) {
        console.error('Error en getAllUsers: ', error)
        return res.status(500).json({
            success: false,
            message: 'error al consultar usuarios'
        })
    }
}

//4. obtener usuario por id (admin y coordinador)
exports.getAllUserById = async (req, res) => {
    console.log('\n=== INICIO DE CONSULTA POR ID')

    try {
        //1. validacion de extrema del ID
        const id = req.params.id;
        console.log('[1] ID recibido: ', id);

        if (!id || typeof id !== 'string' || id.length !== 24) {
            console.log('[ERROR] ID invalido')
            return res.status(400).json({
                success: false,
                message: 'ID de usuario no valido'
            })
        }

        // 2. control de acceso (como en otros endpoints)
        console.log('[2] verificando permisos...')
        const isAllowed = req.roles.includes('admin') || req.roles.includes('coordinador') || req.userId === id;

        if (!isAllowed) {
            console.log('[PERMISO DENEGADO]');
            return res.status(403).json({
                success: false,
                message: 'no autorizado'
            })
        }

        //3. consulta directa a MongoDB (sin relaciones)
        console.log('[3] ejecutando consulta directa...')
        const db = req.app.get('mongoDb'); //conexion directa a mongodb

        //3.1 buscar usuario 
        const user = await db.collection('users').findOne(
            { _id: new ObjectId(id) },
            { projection: { _id: 1, username: 1, email: 1, createAt: 1, updateAt: 1 } }
        )

        console.log('[4] Usuario encontrado ', user)
        if (!user) {
            console.log('[ERROR] usuario no existe');
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        //3.2 buscar roles en dos pasos
        console.log('[5] buscando roles...');
        const userRoles = await db.collection('user_roles').find(
            { userId: new ObjectId(id) }
        ).toArray();

        const roleIds = userRoles.map(ur => ur.roleId);
        const roles = await db.collection('roles').find(
            { _id: { $in: roleIds } }
        ).toArray();

        console.log('[6] roles encontrados: ', roles.map(r => r.name));

        //4.formatear respuesta
        const response = {
            success: true,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                roles: roles.map(r => r.name),
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        }

        console.log('[7] CONSULTA EXITOSA');
        return res.json(response);

    } catch (error) {
        console.error('[ERROR CRITICO]', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            details: {
                errorCode: error.code || 'N/A',
                errorType: error.name
            }
        })

        return res.status(500).json({
            success: false,
            message: 'error al obtener usuario',
            error: process.env.NODE_ENV === 'development' ? {
                type: error.name,
                message: error.message,
                code: error.code
            } : undefined
        })
    }
}

// 5. actualizar usuario (admin puede actualizar todos, coordinador solo auxiliares, auxiliar solo a si mismo)
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const currentUserRole = req.userRole;
        const currentUserId = req.userId;

        // buscar usuario a actualizar 
        const userToUpdate = await User.findById(id);
        if (!userToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        //verificar permisos 
        if (currentUserRole === ROLES.AUXILIAR && userToUpdate._id.toString() !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'solo puedes modificar tu propio perfil'
            })
        }

        if (currentUserRole === ROLES.COORDINADOR && userToUpdate.role === ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: ' no puedes modificar administradores'
            })
        }

        //Actualizar campos permitidos
        const allowedFields = ['name', 'email']
        if (currentUserRole === ROLES.ADMIN) {
            allowedFields.push('role');
        }

        const filteredUpdates = {}
        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredUpdates[key] = updates[key];
            }
        })

        //si se actualiza password, hacer hash
        if (updates.password) {
            filteredUpdates.password = bcrypt.hashSync(updates.password, 8)
        }

        const updatedUser = await User.findByIdAndUpdate(id, filteredUpdates, { new: true }).select('-password-__v');

        return res.status(200).json({
            success: true,
            message: 'usuario actualizado',
            data: updatedUser
        })

    } catch (error) {
        console.error('Error en updateUser', error)
        return res.status(500).json({
            success: false,
            message: 'error al actualizar usuario'
        })
    }
}

// 6. eliminar usuario (solo admin)
exports.deleteUser = async (req, res) => {
    try {
        // verificar quw sea admin 
        if (!checkPermission(req.userRole, [ROLES.ADMIN])) {
            return res.status(400).json({
                success: false,
                message: 'solo administradores pueden eliminar usuarios'
            })
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id)

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'usuario no encontrado'
            })
        }

        return res.status(200).json({
            success: true,
            messsage: 'usuario eliminado correctamente'
        })
    } catch (error) {
        console.error('error en deleteUser', error)
        return res.status(500).json({
            success: false,
            message: 'error al eliminar usuario'
        })
    }
}