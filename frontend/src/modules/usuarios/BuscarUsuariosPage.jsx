import { useEffect, useState } from 'react';

import AlertMessage from '../../components/AlertMessage.jsx';
import Cargando from '../../components/Cargando.jsx';
import EstadoVacio from '../../components/EstadoVacio.jsx';
import Paginacion from '../../components/Paginacion.jsx';
import { mensajeDeError } from '../../utils/errores.js';

import FiltrosUsuarios from './components/FiltrosUsuarios.jsx';
import UsuarioTarjeta from './components/UsuarioTarjeta.jsx';
import { listarUsuarios } from './usuarios.api.js';

const FILTROS_INICIALES = {
    nombre: '',
    ciudad: '',
    pais: '',
    habilidadOfrecida: '',
    habilidadRequerida: ''
};

const TAMANO_PAGINA = 9;

export default function BuscarUsuariosPage() {
    const [borrador, setBorrador] = useState(FILTROS_INICIALES);
    const [consulta, setConsulta] = useState({
        ...FILTROS_INICIALES,
        page: 1,
        limit: TAMANO_PAGINA
    });

    const [datos, setDatos] = useState({ usuarios: [], paginacion: null });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // La búsqueda se repite solo cuando cambia la consulta aplicada.
    useEffect(() => {
        const controlador = new AbortController();

        async function cargarUsuarios() {
            try {
                const resultado = await listarUsuarios(consulta, {
                    signal: controlador.signal
                });

                if (!controlador.signal.aborted) {
                    setDatos(resultado);
                    setError('');
                }
            } catch (errorCarga) {
                if (!controlador.signal.aborted) {
                    setError(mensajeDeError(errorCarga));
                }
            } finally {
                if (!controlador.signal.aborted) {
                    setCargando(false);
                }
            }
        }

        cargarUsuarios();

        return () => controlador.abort();
    }, [consulta]);

    function cambiarFiltro(evento) {
        const { name, value } = evento.target;

        setBorrador((actuales) => ({ ...actuales, [name]: value }));
    }

    function aplicarFiltros(evento) {
        evento.preventDefault();

        setCargando(true);
        setConsulta({ ...borrador, page: 1, limit: TAMANO_PAGINA });
    }

    function limpiarFiltros() {
        setBorrador(FILTROS_INICIALES);
        setCargando(true);
        setConsulta({ ...FILTROS_INICIALES, page: 1, limit: TAMANO_PAGINA });
    }

    function cambiarPagina(pagina) {
        setCargando(true);
        setConsulta((actual) => ({ ...actual, page: pagina }));
    }

    return (
        <section>
            <div className="mb-6">
                <p className="text-sm font-medium text-primary">
                    Comunidad SkillMatch
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-text-main">
                    Buscar personas
                </h1>

                <p className="mt-2 max-w-2xl text-text-muted">
                    Encuentra personas por nombre, ciudad o por la habilidad que
                    ofrecen o quieren aprender.
                </p>
            </div>

            <FiltrosUsuarios
                valores={borrador}
                onCambiar={cambiarFiltro}
                onAplicar={aplicarFiltros}
                onLimpiar={limpiarFiltros}
                cargando={cargando}
            />

            <div className="mt-6">
                {error && (
                    <div className="mb-4">
                        <AlertMessage>{error}</AlertMessage>
                    </div>
                )}

                {cargando ? (
                    <Cargando mensaje="Buscando personas…" />
                ) : datos.usuarios.length === 0 ? (
                    <EstadoVacio titulo="No encontramos coincidencias">
                        Prueba con menos filtros o con otra habilidad.
                    </EstadoVacio>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {datos.usuarios.map((usuario) => (
                            <UsuarioTarjeta
                                key={usuario.idUsuario}
                                usuario={usuario}
                            />
                        ))}
                    </div>
                )}

                <Paginacion
                    paginacion={datos.paginacion}
                    onAnterior={() => cambiarPagina(datos.paginacion.pagina - 1)}
                    onSiguiente={() =>
                        cambiarPagina(datos.paginacion.pagina + 1)
                    }
                    deshabilitado={cargando}
                />
            </div>
        </section>
    );
}
