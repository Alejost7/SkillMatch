import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(false);
    const [mensajeError, setMensajeError] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((prev) => ({
        ...prev,
        [name]: value,
        }));

        setErrores((prev) => ({
        ...prev,
        [name]: '',
        }));
    };

    const validarFormulario = () => {
        const nuevosErrores = {};

        if (!formData.email.trim()) {
        nuevosErrores.email = 'El correo electrónico es obligatorio.';
        }

        if (!formData.password) {
        nuevosErrores.password = 'La contraseña es obligatoria.';
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
        // Aquí conectamos el endpoint de autenticación del backend.
        // const respuesta = await fetch('/api/auth/login', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(formData),
        // });

        const respuesta = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(formData)
        })

        console.log('Datos enviados:', formData);
        } catch (error) {
        setMensajeError('No fue posible iniciar sesión. Por favor, intenta nuevamente.');
        } finally {
        setCargando(false);
        }
    };

    return (
        <section className="mx-auto flex max-w-6xl items-center justify-center px-4 py-12 sm:px-6 md:py-20">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-surface p-6 shadow-lg sm:p-8">
            <div className="text-center">
            <h1 className="text-2xl font-bold text-text-main sm:text-3xl">
                Iniciar sesión
            </h1>

            <p className="mt-2 text-sm text-text-muted">
                Ingresa a tu cuenta para continuar aprendiendo y enseñando.
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
                autoComplete="current-password"
                placeholder="••••••••"
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

            <button
                type="submit"
                disabled={cargando}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
                {cargando ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-muted">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="font-medium text-primary hover:underline">
                Regístrate
            </Link>
            </p>
        </div>
        </section>
    );
}