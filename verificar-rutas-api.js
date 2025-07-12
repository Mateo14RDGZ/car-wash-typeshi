/**
 * 🔍 VERIFICADOR DE RUTAS API - DIAGNÓSTICO COMPLETO
 * 
 * Script para verificar que todas las rutas de API están correctas
 * en todos los archivos del proyecto.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO RUTAS DE API EN TODO EL PROYECTO');
console.log('='.repeat(60));

const archivosAVerificar = [
    'api-helper.js',
    'src/frontend/api-helper.js',
    'public/api-helper.js'
];

let rutasCorrectas = 0;
let rutasIncorrectas = 0;

archivosAVerificar.forEach(archivo => {
    console.log(`\n📄 Verificando: ${archivo}`);
    
    try {
        if (fs.existsSync(archivo)) {
            const contenido = fs.readFileSync(archivo, 'utf8');
            
            // Buscar todas las referencias a api-bridge
            const lineas = contenido.split('\n');
            lineas.forEach((linea, indice) => {
                if (linea.includes('/api-bridge')) {
                    if (linea.includes('/api/api-bridge')) {
                        console.log(`  ✅ Línea ${indice + 1}: CORRECTA - ${linea.trim()}`);
                        rutasCorrectas++;
                    } else {
                        console.log(`  ❌ Línea ${indice + 1}: INCORRECTA - ${linea.trim()}`);
                        rutasIncorrectas++;
                    }
                }
            });
        } else {
            console.log(`  ⚠️ Archivo no encontrado: ${archivo}`);
        }
    } catch (error) {
        console.log(`  ❌ Error al leer archivo: ${error.message}`);
    }
});

console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE VERIFICACIÓN:');
console.log(`✅ Rutas correctas: ${rutasCorrectas}`);
console.log(`❌ Rutas incorrectas: ${rutasIncorrectas}`);

if (rutasIncorrectas === 0) {
    console.log('🎉 ¡TODAS LAS RUTAS ESTÁN CORRECTAS!');
    console.log('🚀 El sistema debería funcionar correctamente en producción.');
} else {
    console.log('⚠️ HAY RUTAS INCORRECTAS QUE NECESITAN CORRECCIÓN');
    console.log('🛠️ Por favor, corrige las rutas marcadas como incorrectas.');
}

console.log('\n🔍 Verificación completada');
