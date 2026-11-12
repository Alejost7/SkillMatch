import { Link } from 'react-router-dom';

// Contenido de la política alineado con los datos que la aplicación guarda de
// verdad: usuario, perfil, habilidades, solicitudes, conexiones, mensajes,
// calificaciones y aceptación de la política (ver database/shema.sql).
const SECCIONES = [
    {
        titulo: '1. Responsable del tratamiento',
        parrafos: [
            'SkillMatch es una aplicación web académica para intercambiar habilidades y conocimientos. El responsable del tratamiento de los datos personales es el equipo desarrollador que despliega y mantiene la plataforma.',
            'Canal de atención para asuntos de privacidad: el correo electrónico de contacto del equipo responsable, publicado en la documentación del proyecto (README.md del repositorio). Toda solicitud que llegue por ese canal se atiende dentro de los plazos de la Ley 1581 de 2012.'
        ],
        items: []
    },
    {
        titulo: '2. Datos personales que tratamos',
        parrafos: [
            'Solo se recolectan los datos necesarios para que el intercambio de habilidades funcione. Al crear una cuenta y usar la plataforma se tratan las siguientes categorías:'
        ],
        items: [
            'Datos de la cuenta: nombres, apellidos, alias, correo electrónico, fecha de registro, último acceso y estado de la cuenta (activo, inactivo, suspendido o eliminado). La contraseña se almacena cifrada con bcrypt; nunca se guarda en texto claro ni se muestra en ninguna respuesta de la aplicación.',
            'Datos del perfil: biografía, enlace a la foto de perfil, disponibilidad, ciudad y país. Todos son opcionales.',
            'Habilidades: habilidades que ofreces y que quieres aprender, nivel, descripción de apoyo y objetivo de aprendizaje.',
            'Interacciones: solicitudes de conexión con su mensaje inicial y fechas de envío y respuesta, conexiones aceptadas, mensajes privados (contenido, remitente y fecha de envío), calificaciones con puntuación y comentario, y registros de moderación cuando existan.',
            'Datos técnicos: el identificador de sesión (token JWT con caducidad) que el navegador guarda en su almacenamiento local, la fecha y la dirección IP del momento en que aceptas esta política, y los registros del servidor necesarios para operar y diagnosticar fallos.'
        ]
    },
    {
        titulo: '3. Para qué usamos los datos',
        parrafos: [
            'Los datos se tratan con las siguientes finalidades, todas relacionadas con el servicio:'
        ],
        items: [
            'Crear y mantener tu cuenta, autenticarte y permitirte recuperar el acceso.',
            'Mostrar tu perfil y tus habilidades a otras personas usuarias para facilitar el intercambio.',
            'Gestionar solicitudes de conexión, conversaciones, mensajería privada y calificaciones.',
            'Enviarte avisos dentro de la aplicación: solicitudes pendientes, mensajes sin leer e intercambios por calificar.',
            'Moderar conductas contrarias a las normas de convivencia y proteger la seguridad de la comunidad.',
            'Elaborar estadísticas agregadas y anónimas para mejorar la plataforma.',
            'Cumplir obligaciones legales o atender requerimientos de autoridad competente.'
        ]
    },
    {
        titulo: '4. Autorización y aceptación',
        parrafos: [
            'Al registrarte marcas la casilla de aceptación de esta política. Con esa acción otorgas una autorización previa, expresa e informada para el tratamiento de tus datos personales en los términos de la Ley 1581 de 2012 y del Decreto 1377 de 2013.',
            'La aceptación se registra con la fecha del momento, la versión de la política vigente y la dirección IP desde la que se aceptó, de modo que exista evidencia verificable de la autorización.'
        ],
        items: []
    },
    {
        titulo: '5. Qué información ven otras personas',
        parrafos: [
            'La plataforma es un espacio de encuentro, así que parte de tu información es visible para el resto de la comunidad mientras tu cuenta esté activa:'
        ],
        items: [
            'Público dentro de la aplicación: alias, nombres y apellidos, biografía, ciudad, país, habilidades ofrecidas y deseadas con su nivel, y las calificaciones que has recibido.',
            'Privado: tu correo electrónico, tu contraseña cifrada y los mensajes de conversaciones en las que no participas. El correo solo se usa para iniciar sesión y para comunicaciones del servicio.',
            'Los mensajes privados solo los pueden leer las dos personas de la conexión. El equipo administrador no los revisa, salvo que exista una denuncia, una orden de autoridad competente o una obligación legal.'
        ]
    },
    {
        titulo: '6. Datos sensibles',
        parrafos: [
            'SkillMatch no solicita datos sensibles como estado de salud, orientación sexual, convicciones religiosas, datos biométricos ni información financiera. Te pedimos no incluirlos en tu biografía, en las descripciones de tus habilidades ni en los mensajes.',
            'Si detectamos contenido de ese tipo, se elimina y se informa a la persona que lo publicó.'
        ],
        items: []
    },
    {
        titulo: '7. Menores de edad',
        parrafos: [
            'El servicio está pensado para personas mayores de 18 años. El tratamiento de datos de niños, niñas y adolescentes requiere la autorización previa de su representante legal, conforme al artículo 7 de la Ley 1581 de 2012.',
            'Si eres menor de edad y no cuentas con esa autorización, no crees una cuenta. Si ya existe una, escríbenos al canal de atención para eliminarla.'
        ],
        items: []
    },
    {
        titulo: '8. Conservación y eliminación',
        parrafos: [
            'Los datos se conservan mientras tu cuenta esté activa y sean necesarios para las finalidades descritas.',
            'Cuando pides la eliminación de la cuenta, el acceso se desactiva y el estado pasa a "eliminado". Por la forma en que están relacionadas las tablas, los registros de intercambios ya realizados (conexiones, mensajes y calificaciones) se conservan para mantener la trazabilidad del servicio y la integridad de las calificaciones de las otras personas.',
            'Si necesitas la supresión total de tus datos, escríbenos al canal de atención: se elimina lo que no tenga un deber legal de conservación y se responde en los plazos de ley.'
        ],
        items: []
    },
    {
        titulo: '9. Medidas de seguridad',
        parrafos: [
            'Aplicamos medidas técnicas y administrativas razonables para proteger la información:'
        ],
        items: [
            'Las contraseñas se almacenan con bcrypt (con sal por usuario) y nunca se devuelven en las respuestas de la API.',
            'La autenticación se hace con tokens JWT firmados y con caducidad; cada petición se valida en el servidor.',
            'El acceso a la base de datos está restringido a la aplicación, con un usuario que solo tiene los permisos necesarios.',
            'En un despliegue real el sitio debe servirse por HTTPS para proteger las credenciales y los mensajes en tránsito.',
            'El canal de notificaciones en tiempo real se autentica con el token en la dirección de la conexión; por eso se recomienda desactivar el registro de la cadena de consulta en los logs del servidor de producción.'
        ]
    },
    {
        titulo: '10. Tus derechos como titular',
        parrafos: [
            'De acuerdo con la Ley 1581 de 2012 puedes ejercer en cualquier momento los siguientes derechos:'
        ],
        items: [
            'Conocer, actualizar y rectificar tus datos personales.',
            'Solicitar prueba de la autorización que otorgaste, salvo cuando la ley no la exija.',
            'Ser informado sobre el uso que se da a tus datos.',
            'Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la normativa de protección de datos.',
            'Revocar la autorización y solicitar la supresión de tus datos, cuando no exista un deber legal o contractual de conservarlos.',
            'Acceder de forma gratuita a tus datos personales.'
        ]
    },
    {
        titulo: '11. Almacenamiento local y cookies',
        parrafos: [
            'SkillMatch no usa cookies de publicidad ni de terceros. Para mantener tu sesión abierta, el navegador guarda en su almacenamiento local una entrada con el token de acceso y los datos básicos de tu usuario.',
            'Al cerrar sesión esa entrada se elimina. Si borras los datos del navegador, tendrás que iniciar sesión de nuevo.'
        ],
        items: []
    },
    {
        titulo: '12. Cambios en esta política',
        parrafos: [
            'La política puede actualizarse por cambios legales o por nuevas funciones de la plataforma. Cada versión se publica en esta misma página con su número y su fecha.',
            'Cuando el cambio afecte las finalidades del tratamiento, se pedirá una nueva aceptación al ingresar a la aplicación.'
        ],
        items: []
    },
    {
        titulo: '13. Vigencia',
        parrafos: [
            'Esta versión (1.0) rige desde el 12 de noviembre de 2026. Las versiones anteriores quedan archivadas con su fecha de publicación.'
        ],
        items: []
    }
];

/**
 * Política de tratamiento de datos personales.
 * Es una página pública: se enlaza desde el registro y desde el pie de página.
 */
export default function PoliticaDatosPage() {
    return (
        <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Legal
            </p>

            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-text-main sm:text-4xl">
                Política de tratamiento de datos personales
            </h1>

            <p className="mt-3 text-sm text-text-muted">
                Versión 1.0 · Última actualización: 12 de noviembre de 2026
            </p>

            <p className="mt-6 text-sm leading-relaxed text-text-muted">
                Esta política explica qué datos personales recolecta SkillMatch,
                para qué los usa, cuánto tiempo los conserva y cómo puedes
                ejercer tus derechos como titular. Aplica a todas las personas
                que crean una cuenta y usan la plataforma.
            </p>

            <div className="mt-10 space-y-8">
                {SECCIONES.map((seccion) => (
                    <section key={seccion.titulo}>
                        <h2 className="text-lg font-semibold text-text-main">
                            {seccion.titulo}
                        </h2>

                        {seccion.parrafos.map((texto) => (
                            <p
                                key={texto}
                                className="mt-3 text-sm leading-relaxed text-text-muted"
                            >
                                {texto}
                            </p>
                        ))}

                        {seccion.items.length > 0 && (
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-text-muted">
                                {seccion.items.map((texto) => (
                                    <li key={texto}>{texto}</li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}
            </div>

            <div className="mt-10 rounded-2xl border border-slate-800 bg-surface p-6">
                <h2 className="text-lg font-semibold text-text-main">
                    ¿Necesitas ejercer tus derechos?
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                    Puedes actualizar tus datos desde tu perfil. Para consultas,
                    rectificaciones o la supresión de la cuenta, escribe al
                    canal de atención del equipo responsable indicando tu alias
                    y el correo con el que te registraste. Las consultas se
                    responden en un máximo de 10 días hábiles y los reclamos en
                    15 días hábiles, con las prórrogas que permite la ley.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                        to="/"
                        className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-primary-dark"
                    >
                        Volver al inicio
                    </Link>

                    <Link
                        to="/login"
                        className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-text-main transition hover:bg-slate-800"
                    >
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        </article>
    );
}
