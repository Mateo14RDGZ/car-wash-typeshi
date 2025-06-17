// API Route para Vercel - Servicios Disponibles

const servicios = [
    {
        id: 1,
        name: 'Lavado Básico',
        price: 300,
        duration: 90,
        description: 'Lavado exterior e interior básico'
    },
    {
        id: 2,
        name: 'Lavado Completo',
        price: 500,
        duration: 90,
        description: 'Lavado completo con aspirado y encerado'
    },
    {
        id: 3,
        name: 'Lavado Premium',
        price: 700,
        duration: 90,
        description: 'Lavado premium con detalles especiales'
    },
    {
        id: 4,
        name: 'Encerado',
        price: 400,
        duration: 90,
        description: 'Encerado profesional'
    }
];

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Manejar preflight OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({
            status: 'ERROR',
            message: 'Método no permitido'
        });
    }
    
    try {
        return res.status(200).json({
            status: 'SUCCESS',
            data: servicios
        });
        
    } catch (error) {
        console.error('Vercel - Error al obtener servicios:', error);
        
        return res.status(500).json({
            status: 'ERROR',
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
