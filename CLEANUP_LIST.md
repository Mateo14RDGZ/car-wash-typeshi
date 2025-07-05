# ARCHIVOS PARA ELIMINAR DESPUÉS DE VERIFICAR QUE FUNCIONEN LOS HORARIOS

## Archivos de prueba y testing (ELIMINAR PRIMERO):

- test-frontend.html
- test-api-bridge.js
- test-production.html
- monitor-reservas.html

## Scripts y archivos de desarrollo no necesarios en producción:

- copy-frontend-to-public.js
- README_DEPLOY_FIX.txt
- DATABASE_SETUP.md

## Backend completo (ya no se usa en Vercel):

- src/backend/ (toda la carpeta - contiene server.js, routes/, services/, etc.)

## API Bridge original (ahora está en api/):

- api-bridge.js (raíz del proyecto)

## Archivos de configuración locales innecesarios:

- .htaccess
- .vercelignore

## Helpers frontend no utilizados:

- src/frontend/timeSlots-client.js
- src/frontend/horarios-helper.js
- src/frontend/fecha-handler.js

## Archivos que MANTENER (esenciales):

- api/ (carpeta completa con bookings/)
- src/frontend/ (app.js, api-helper.js, index.html, styles.css, additional-styles.css, robots.txt)
- src/database/ (carpeta completa)
- package.json, package-lock.json
- vercel.json
- .nvmrc
- .gitignore
- README.md

## TOTAL A ELIMINAR: ~15-20 archivos y 1 carpeta grande (src/backend/)
