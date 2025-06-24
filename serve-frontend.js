#!/usr/bin/env node

/**
 * Servidor HTTP simple para servir los archivos del frontend
 * Esto evita problemas de CORS y cache que ocurren al abrir archivos con file://
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const FRONTEND_DIR = path.join(__dirname, 'src', 'frontend');

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;
      // Handle API Bridge requests
    if (pathname.startsWith('/api-bridge')) {
        console.log('🔀 Redirigiendo a api-bridge:', req.url);
        
        try {
            // Import and execute api-bridge
            const apiBridge = require('./api-bridge.js');
            
            // Setup req.query from parsed URL
            req.query = parsedUrl.query || {};
            
            // Create a mock response object that matches Express.js interface
            const mockRes = {
                statusCode: 200,
                headers: {},
                setHeader: function(name, value) {
                    this.headers[name] = value;
                },
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    res.writeHead(this.statusCode, {
                        'Content-Type': 'application/json',
                        ...this.headers
                    });
                    res.end(JSON.stringify(data));
                    return this;
                },
                end: function() {
                    res.end();
                }
            };
            
            // Handle body for POST requests
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', async () => {
                    try {
                        req.body = JSON.parse(body);
                    } catch (e) {
                        req.body = body;
                    }
                    
                    // Execute api-bridge
                    await apiBridge(req, mockRes);
                });
            } else {
                // For GET requests
                await apiBridge(req, mockRes);
            }
            return;
        } catch (error) {
            console.error('❌ Error en api-bridge:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error interno del servidor' }));
            return;
        }
    }
    
    // Default to index.html
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Security: prevent directory traversal
    const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(FRONTEND_DIR, safePath);
    
    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Archivo no encontrado</h1>');
            return;
        }
        
        // File exists, read and serve it
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - Error interno del servidor</h1>');
                return;
            }
            
            // Get file extension
            const ext = path.extname(filePath).toLowerCase();
            const contentType = mimeTypes[ext] || 'application/octet-stream';
            
            // Set headers to prevent caching during development
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log('');
    console.log('🌐 ===================================');
    console.log('   SERVIDOR FRONTEND INICIADO');
    console.log('🌐 ===================================');
    console.log(`   📁 Sirviendo: ${FRONTEND_DIR}`);
    console.log(`   🔗 URL: http://localhost:${PORT}`);
    console.log(`   📱 Abre esta URL en tu navegador`);
    console.log('🌐 ===================================');
    console.log('');
    console.log('💡 INSTRUCCIONES:');
    console.log('   1. Asegúrate de que el backend esté ejecutándose en puerto 3003');
    console.log('   2. Abre http://localhost:8080 en tu navegador');
    console.log('   3. Presiona Ctrl+C para detener este servidor');
    console.log('');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ El puerto ${PORT} ya está en uso.`);
        console.log('💡 Intenta cerrar otras aplicaciones o usar otro puerto.');
    } else {
        console.error('❌ Error del servidor:', err);
    }
});
