<?php

return [
    'defaults' => [
        'guard' => 'web',
        'passwords' => 'profesores',
    ],

    'guards' => [
        'web' => [
            'driver' => 'session',
            'provider' => 'profesores',
        ],
        'api' => [
            'driver' => 'sanctum',
            'provider' => 'profesores',
            'hash' => false,
        ],
    ],

    'providers' => [
        'profesores' => [
            'driver' => 'mongodb',
            'model' => App\Models\Teacher::class,
        ],
    ],

    'passwords' => [
        'profesores' => [
            'provider' => 'profesores',
            'table' => 'password_resets',
            'expire' => 60,
            'throttle' => 60,
        ],
    ],
];