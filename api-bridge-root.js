/**
 * API Bridge Alternativo para Vercel
 * Función serverless en la raíz para debugging
 */

// Importar el bridge principal
const apiBridge = require('./api/api-bridge');

// Exportar como función de Vercel
module.exports = apiBridge;
