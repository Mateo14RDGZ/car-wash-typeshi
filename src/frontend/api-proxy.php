<?php
/**
 * API Proxy mejorado para car-wash-typeshi
 * Este script maneja solicitudes GET y POST a la API, evitando problemas de CORS y bloqueos
 */

// Permitir solicitudes de cualquier origen (CORS)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Si es una solicitud OPTIONS, terminar aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Obtener el endpoint solicitado
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';
if (empty($endpoint)) {
    http_response_code(400);
    echo json_encode(['error' => 'Se requiere un endpoint']);
    exit;
}

// URLs para intentar (primero localhost, luego API de Vercel)
$apiBaseUrls = [
    'http://localhost:3003/api',
    'https://car-wash-typeshi.vercel.app/api'
];

// Variable para almacenar la respuesta
$apiResponse = null;
$apiSuccess = false;
$lastErrorMsg = '';

// Intentar cada URL hasta que una funcione
foreach ($apiBaseUrls as $apiBaseUrl) {
    $url = $apiBaseUrl . '/' . ltrim($endpoint, '/');
    
    try {
        // Inicializar cURL
        $curl = curl_init();
        
        // Configuraciones comunes
        curl_setopt_array($curl, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_SSL_VERIFYPEER => false, // Solo para desarrollo
            CURLOPT_SSL_VERIFYHOST => false  // Solo para desarrollo
        ]);
        
        // Manejar método según la solicitud original
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
        
        // Si es POST/PUT, enviar los datos del cuerpo
        if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $inputData = file_get_contents('php://input');
            curl_setopt($curl, CURLOPT_POSTFIELDS, $inputData);
            curl_setopt($curl, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }
        
        // Ejecutar la solicitud
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        
        // Si hay un error, guardar el mensaje
        if (curl_errno($curl)) {
            $lastErrorMsg = curl_error($curl);
            curl_close($curl);
            continue; // Probar la siguiente URL
        }
        
        // Si la solicitud fue exitosa (código 2xx)
        if ($httpCode >= 200 && $httpCode < 300) {
            $apiResponse = $response;
            $apiSuccess = true;
            curl_close($curl);
            break; // Salir del bucle, ya tenemos una respuesta exitosa
        }
        
        // Si llegamos aquí, la respuesta no fue exitosa, guardar el código y probar la siguiente URL
        $lastErrorMsg = "Error HTTP: " . $httpCode;
        curl_close($curl);
    } catch (Exception $e) {
        $lastErrorMsg = $e->getMessage();
        // Continuar con la siguiente URL
    }
}

// Devolver respuesta o error
if ($apiSuccess) {
    // Mantener el código de estado original
    echo $apiResponse;
} else {
    // Si todas las URLs fallaron
    http_response_code(500);
    echo json_encode([
        'error' => 'No se pudo conectar a ninguna API',
        'details' => $lastErrorMsg,
        'status' => 'FALLBACK_ERROR',
        'fallback' => true,
        'timestamp' => date('c')
    ]);
}
