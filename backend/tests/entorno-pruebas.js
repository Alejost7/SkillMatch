// Variables de entorno mínimas para ejecutar las pruebas automatizadas.
//
// Este módulo se carga antes que las pruebas (ver los scripts "test" y
// "test:watch" de package.json). Si el archivo .env ya define una variable,
// se respeta su valor, porque dotenv no sobrescribe variables existentes.
//
// Ninguna prueba se conecta a la base de datos: los valores de DB_* solo
// existen para que la validación de configuración no falle.

process.env.PORT ||= '3999';
process.env.DB_HOST ||= '127.0.0.1';
process.env.DB_PORT ||= '3306';
process.env.DB_NAME ||= 'skillmatch_pruebas';
process.env.DB_USER ||= 'usuario_pruebas';
process.env.DB_PASSWORD ||= 'contrasena_solo_para_pruebas';
process.env.JWT_SECRET ||= 'secreto_solo_para_pruebas_automatizadas';
process.env.JWT_EXPIRES_IN ||= '1h';
