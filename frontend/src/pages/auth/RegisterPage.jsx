import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmarPassword: '',
        aceptaPolitica: false,
    });

    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);
    const [mensajeError, setMensajeError] = useState('');

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        }));

        setErrores((prev) => ({
        ...prev,
        [name]: '',
        }));
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.nombre.trim()) {
        nuevosErrores.nombre = 'El nombre es obligatorio.';
        }

        if (!formData.email.trim()) {
        nuevosErrores.email = 'El correo electrónico es obligatorio.';
        }

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
        // Aquí luego se conecta el endpoint de registro del backend.
        // const respuesta = await fetch('/api/auth/registro', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     nombre: formData.nombre,
        //     email: formData.email,
        //     password: formData.password,
        //   }),
        // });

        console.log('Datos enviados:', formData);
        } catch (error) {
        setMensajeError('No fue posible crear la cuenta. Intenta nuevamente.');
        } finally {
        setCargando(false);
        }
    };

    return (
        <section className="mx-auto flex max-w-6xl items-center justify-center px-4 py-12 sm:px-6 md:py-20">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-surface p-6 shadow-lg sm:p-8">
            <div className="text-center">
            <h1 className="text-2xl font-bold text-text-main sm:text-3xl">
                Crear cuenta
            </h1>

            <p className="mt-2 text-sm text-text-muted">
                Únete a SkillMatch y comienza a intercambiar conocimientos.
            </p>
            </div>

            {mensajeError && (
            <div className="mt-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
                {mensajeError}
            </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <div>
                <label
                htmlFor="nombre"
                className="mb-2 block text-sm font-medium text-text-main"
                >
                Nombre
                </label>

                <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                autoComplete="name"
                placeholder="Tu nombre completo"
                className={`w-full rounded-lg border bg-surface-alt px-3 py-2.5 text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 ${
                    errores.nombre
                    ? 'border-danger focus:ring-danger'
                    : 'border-slate-700 focus:ring-primary'
                }`}
                />

                {errores.nombre && (
                <p className="mt-1 text-sm text-danger">{errores.nombre}</p>
                )}
            </div>

            <div>
                <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-text-main"
                >
                Correo electrónico
                </label>

                <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                placeholder="tucorreo@example.com"
                className={`w-full rounded-lg border bg-surface-alt px-3 py-2.5 text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 ${
                    errores.email
                    ? 'border-danger focus:ring-danger'
                    : 'border-slate-700 focus:ring-primary'
                }`}
                />

                {errores.email && (
                <p className="mt-1 text-sm text-danger">{errores.email}</p>
                )}
            </div>

            <div>
                <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-text-main"
                >
                Contraseña
                </label>

                <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className={`w-full rounded-lg border bg-surface-alt px-3 py-2.5 text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 ${
                    errores.password
                    ? 'border-danger focus:ring-danger'
                    : 'border-slate-700 focus:ring-primary'
                }`}
                />

                {errores.password && (
                <p className="mt-1 text-sm text-danger">{errores.password}</p>
                )}
            </div>

            <div>
                <label
                htmlFor="confirmarPassword"
                className="mb-2 block text-sm font-medium text-text-main"
                >
                Confirmar contraseña
                </label>

                <input
                type="password"
                id="confirmarPassword"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                className={`w-full rounded-lg border bg-surface-alt px-3 py-2.5 text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 ${
                    errores.confirmarPassword
                    ? 'border-danger focus:ring-danger'
                    : 'border-slate-700 focus:ring-primary'
                }`}
                />

                {errores.confirmarPassword && (
                <p className="mt-1 text-sm text-danger">
                    {errores.confirmarPassword}
                </p>
                )}
            </div>

            <div>
                <label className="flex items-start gap-3 text-sm text-text-muted">
                <input
                    type="checkbox"
                    name="aceptaPolitica"
                    checked={formData.aceptaPolitica}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-surface-alt text-primary focus:ring-primary"
                />

                <span>
                    Acepto la{' '}
                    <Link
                    to="/politica-datos"
                    className="font-medium text-primary hover:underline"
                    >
                    política de tratamiento de datos personales
                    </Link>
                    .
                </span>
                </label>

                {errores.aceptaPolitica && (
                <p className="mt-1 text-sm text-danger">
                    {errores.aceptaPolitica}
                </p>
                )}
            </div>

            <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
                {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
                Inicia sesión
            </Link>
            </p>
        </div>
        </section>
    );
}