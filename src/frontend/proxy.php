<?php
/**
 * Este archivo actúa como un proxy para las llamadas a la API
 * Puede ayudar a evitar bloqueos por parte de extensiones del navegador
 */

// Permitir solicitudes de cualquier origen (CORS)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Si es una solicitud OPTIONS, terminar aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// URL base de la API
$apiUrl = 'http://localhost:3003/api';

// Obtener la ruta solicitada
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

// Construir la URL completa
$url = $apiUrl . '/' . ltrim($endpoint, '/');

// Inicializar cURL
$curl = curl_init();

// Configurar la solicitud cURL
curl_setopt_array($curl, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_CUSTOMREQUEST => $_SERVER['REQUEST_METHOD'],
    CURLOPT_SSL_VERIFYPEER => false, // Solo para desarrollo
    CURLOPT_SSL_VERIFYHOST => false  // Solo para desarrollo
]);

// Si es POST, enviar los datos del cuerpo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputData = file_get_contents('php://input');
    curl_setopt($curl, CURLOPT_POSTFIELDS, $inputData);
    curl_setopt($curl, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
}

// Ejecutar la solicitud
$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

// Establecer el código de estado HTTP
http_response_code($httpCode);

// Devolver la respuesta
if ($response === false) {
    echo json_encode([
        'error' => curl_error($curl),
        'code' => $httpCode
    ]);
} else {
    echo $response;
}

// Cerrar cURL
curl_close($curl);
