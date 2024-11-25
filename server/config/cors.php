<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', '*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('APP_URL', 'https://teacherconnect-app.azurewebsites.net'),
        'https://teacherconnect-faa3grg8g8cabgcr.scm.westeurope-01.azurewebsites.net',
        'https://teacherconnect-faa3grg8g8cabgcr.westeurope-01.azurewebsites.net',
        'http://localhost:3000'
    ],

    'allowed_origins_patterns' => [
        '#^https?://.*\.azurewebsites\.net$#',
    ],

    'allowed_headers' => [
        'X-CSRF-TOKEN',
        'X-Requested-With',
        'Content-Type',
        'Origin',
        'Authorization',
        'Accept',
        'X-XSRF-TOKEN'
    ],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];