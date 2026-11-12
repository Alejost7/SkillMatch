import { Link, useNavigate } from 'react-router-dom';
import { useRegisterForm } from '../../features/auth/hooks/useRegisterForm';
import { FormField } from '../../features/auth/components/FormField';

export default function RegisterPage() {
    const navigate = useNavigate();
    const {
        formData,
        errores,
        cargando,
        mensajeError,
        handleChange,
        handleSubmit,
    } = useRegisterForm({
        onSuccess: ({ message }) =>
        navigate('/login', { state: { mensaje: message } }),
    });

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
            <FormField
                id="nombre"
                name="nombre"
                label="Nombre"
                placeholder="Tu nombre completo"
                autoComplete="given-name"
                value={formData.nombre}
                onChange={handleChange}
                error={errores.nombre}
            />

            <FormField
                id="apellidos"
                name="apellidos"
                label="Apellidos"
                placeholder="Tus apellidos"
                autoComplete="family-name"
                value={formData.apellidos}
                onChange={handleChange}
                error={errores.apellidos}
            />

            <FormField
                id="email"
                name="email"
                type="email"
                label="Correo electrónico"
                placeholder="tucorreo@example.com"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={errores.email}
            />

            <FormField
                id="alias"
                name="alias"
                label="Alias (opcional)"
                placeholder="Tu alias"
                autoComplete="nickname"
                value={formData.alias}
                onChange={handleChange}
                error={errores.alias}
            />

            <FormField
                id="password"
                name="password"
                type="password"
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                error={errores.password}
            />

            <FormField
                id="confirmarPassword"
                name="confirmarPassword"
                type="password"
                label="Confirmar contraseña"
                placeholder="Repite tu contraseña"
                autoComplete="new-password"
                value={formData.confirmarPassword}
                onChange={handleChange}
                error={errores.confirmarPassword}
            />

            {/* checkbox de política: NO usa FormField */}
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