<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'], // Rutas donde se aplica CORS

    'allowed_methods' => ['*'], // Permite todos los métodos HTTP

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'), // Esto en local
        'https://teacherconnect-app.azurewebsites.net', // URL de producción
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'], // Permite todos los headers

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true, // Necesario para cookies con credenciales
];
