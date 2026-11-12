import { useState } from 'react';

import { useAuth } from '../useAuth.js';
import { detallesDeError, mensajeDeError } from '../../../utils/errores.js';

const formularioInicial = {
    correoElectronico: '',
    contrasena: ''
};

/**
 * Estado y validación del formulario de inicio de sesión.
 * El envío usa el AuthContext: el token se persiste y la aplicación redirige.
 */
export function useLoginForm({ onSuccess } = {}) {
    const { iniciarSesion } = useAuth();

    const [formData, setFormData] = useState(formularioInicial);
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);
    const [mensajeError, setMensajeError] = useState('');
    const [detalles, setDetalles] = useState([]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrores((prev) => ({ ...prev, [name]: '' }));
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.correoElectronico.trim()) {
            nuevosErrores.correoElectronico =
                'El correo electrónico es obligatorio.';
        }

        if (!formData.contrasena) {
            nuevosErrores.contrasena = 'La contraseña es obligatoria.';
        }

        setErrores(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMensajeError('');
        setDetalles([]);

        if (!validarFormulario()) {
            return;
        }

        setCargando(true);

        try {
            const usuario = await iniciarSesion({
                correoElectronico: formData.correoElectronico.trim(),
                contrasena: formData.contrasena
            });

            onSuccess?.(usuario);
        } catch (error) {
            setMensajeError(
                mensajeDeError(error, 'No fue posible iniciar sesión.')
            );
            setDetalles(detallesDeError(error));
        } finally {
            setCargando(false);
        }
    };

    return {
        formData,
        errores,
        cargando,
        mensajeError,
        detalles,
        handleChange,
        handleSubmit
    };
}
