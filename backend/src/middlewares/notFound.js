export function notFound(req, res) {
    res.status(404).json({
        success: false,
        message: 'Uy, parece que la ruta solicitada no existe.'
    });
}