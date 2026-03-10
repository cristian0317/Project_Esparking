const User = require('../models/User');

// Obtener todos los usuarios de la organización
exports.getAllUsers = async (req, res) => {
    try {
        const organizationId = req.user.organization;
        const users = await User.find({ organization: organizationId }).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', error });
    }
};

// Crear un nuevo usuario para la organización
exports.createUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    const organizationId = req.user.organization; // La organización del admin que lo está creando

    try {
        // Verificamos si el email ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
        }

        // Creamos el nuevo usuario y le asignamos la organización
        const user = await User.create({
            name,
            email,
            password,
            role,
            organization: organizationId 
        });

        res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role, organization: user.organization });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el usuario', error });
    }
};

// Actualizar un usuario de la organización
exports.updateUser = async (req, res) => {
    try {
        const organizationId = req.user.organization;

        // Buscamos al usuario por ID y nos aseguramos que sea de la misma organización
        const user = await User.findOne({ _id: req.params.id, organization: organizationId });

        if (user) {
            user.name = req.body.name || user.name;
            user.role = req.body.role || user.role;

            // Opcional: Cambiar contraseña solo si se proporciona una nueva
            if (req.body.password) {
                user.password = req.body.password;
            }
            
            const updatedUser = await user.save();
            res.status(200).json({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado o no pertenece a su organización' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el usuario', error });
    }
};

// Eliminar un usuario de la organización
exports.deleteUser = async (req, res) => {
    try {
        const organizationId = req.user.organization;

        // Buscamos y eliminamos al usuario solo si coincide el ID y la organización
        const user = await User.findOneAndDelete({ 
            _id: req.params.id, 
            organization: organizationId 
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado o no pertenece a su organización' });
        }

        // Evitar que un admin se elimine a sí mismo
        if (user._id.toString() === req.user._id.toString()) {
             return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta de administrador.' });
        }

        res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el usuario', error });
    }
};