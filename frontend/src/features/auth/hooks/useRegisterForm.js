import { useState } from 'react';
import { registrarUsuario } from '../api/authApi';

const initialForm = {
    nombre: '',
    apellidos: '',
    email: '',
    alias: '',
    password: '',
    confirmarPassword: '',
    aceptaPolitica: false,
};

export function useRegisterForm({ onSuccess } = {}) {
    const [formData, setFormData] = useState(initialForm);
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);
    const [mensajeError, setMensajeError] = useState('');

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        }));
        setErrores((prev) => ({ ...prev, [name]: '' }));
    };

    const validarFormulario = () => {
        const nuevosErrores = {};
        if (!formData.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.';
        if (!formData.apellidos.trim()) nuevosErrores.apellidos = 'Los apellidos son obligatorios.';
        if (!formData.email.trim()) nuevosErrores.email = 'El correo electrónico es obligatorio.';

        if (!formData.password) {
        nuevosErrores.password = 'La contraseña es obligatoria.';
        } else if (formData.password.length < 8) {
        nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres.';
        }

        if (formData.password !== formData.confirmarPassword) {
        nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden.';
        }
        if (!formData.aceptaPolitica) {
        nuevosErrores.aceptaPolitica =
            'Debes aceptar la política de tratamiento de datos personales.';
        }

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMensajeError('');
        if (!validarFormulario()) return;

        setCargando(true);
        try {
        const { message, data } = await registrarUsuario({
            nombres: formData.nombre,
            apellidos: formData.apellidos,
            correoElectronico: formData.email,
            contrasena: formData.password,
            alias: formData.alias || undefined,
        });

        onSuccess?.({ message, usuario: data });
        } catch (error) {
        // apiClient ya construyó el Error con status/message/errors
        setMensajeError(error.message || 'No fue posible crear la cuenta.');
        } finally {
        setCargando(false);
        }
    };

    return { formData, errores, cargando, mensajeError, handleChange, handleSubmit };
}