/**
 * 🔍 DIAGNÓSTICO EXTREMO - SIN DEPENDENCIAS
 * 
 * La versión más minimalista posible para Vercel
 */

module.exports = (req, res) => {
    console.log('🔍 [DIAGNÓSTICO EXTREMO] Iniciando...');
    
    // Headers básicos sin dependencias
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    // Manejar OPTIONS
    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
    }
    
    try {
        // Información básica del sistema
        const info = {
            status: 'SUCCESS',
            message: 'DIAGNÓSTICO EXTREMO - Vercel funcionando',
            timestamp: new Date().toISOString(),
            system: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                memory: process.memoryUsage(),
                uptime: process.uptime()
            },
            request: {
                method: req.method,
                url: req.url,
                headers: req.headers,
                query: req.query || {}
            },
            environment: {
                NODE_ENV: process.env.NODE_ENV || 'undefined',
                VERCEL: process.env.VERCEL || 'undefined',
                VERCEL_URL: process.env.VERCEL_URL || 'undefined'
            },
            test: 'Si estás viendo esto, Vercel está funcionando correctamente'
        };
        
        console.log('✅ Diagnóstico completado exitosamente');
        
        res.statusCode = 200;
        res.end(JSON.stringify(info, null, 2));
        
    } catch (error) {
        console.error('❌ Error en diagnóstico extremo:', error);
        
        const errorInfo = {
            status: 'ERROR',
            message: 'Error en diagnóstico extremo',
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            },
            timestamp: new Date().toISOString()
        };
        
        res.statusCode = 500;
        res.end(JSON.stringify(errorInfo, null, 2));
    }
};
