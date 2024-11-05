<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;

class SetupMongoDB extends Command
{
    protected $signature = 'mongodb:setup';
    protected $description = 'Configuración inicial de MongoDB';

    public function handle()
    {
        try {
            $this->info('Iniciando configuración de MongoDB...');
            
            $client = new Client(env('MONGODB_DSN'));
            $database = $client->selectDatabase(env('MONGODB_DATABASE'));

            // Crear colecciones
            $colecciones = [
                'profesores',     // profesores y admin
                'likes',          // likes entre profesores
                'grupos',         // grupos colaborativos
                'mensajes'        // mensajes de grupos
            ];
            
            foreach ($colecciones as $coleccion) {
                try {
                    $database->createCollection($coleccion);
                    $this->info("Colección '$coleccion' creada exitosamente.");
                } catch (\Exception $e) {
                    $this->warn("La colección '$coleccion' ya existe o error: " . $e->getMessage());
                }
            }

            // Crear índices
            try {
                // Índice único para email en profesores
                $database->profesores->createIndex(['email' => 1], ['unique' => true]);
                
                // Índice para búsqueda rápida por rol
                $database->profesores->createIndex(['rol' => 1]);
                
                // Índice para ordenar por likes
                $database->profesores->createIndex(['contador_likes' => -1]);
                
                // Índice para búsqueda por departamento
                $database->profesores->createIndex(['departamento' => 1]);

                // Índices para likes
                $database->likes->createIndex([
                    'profesor_id' => 1,
                    'dado_por_id' => 1,
                    'tipo_like' => 1
                ], ['unique' => true]);

                // Índices para grupos
                $database->grupos->createIndex(['nombre' => 1]);
                $database->grupos->createIndex(['departamento' => 1]);

                // Índices para mensajes
                $database->mensajes->createIndex(['grupo_id' => 1]);
                $database->mensajes->createIndex(['emisor_id' => 1]);
                
                $this->info("Índices creados exitosamente.");
            } catch (\Exception $e) {
                $this->warn("Error al crear índices: " . $e->getMessage());
            }

            // Insertar administrador
            try {
                $adminExists = $database->profesores->findOne(['email' => 'admin@iesalandalus.org']);
                
                if (!$adminExists) {
                    $admin = [
                        'nombre' => 'Administrador',
                        'email' => 'admin@iesalandalus.org',
                        'password' => password_hash('password', PASSWORD_DEFAULT),
                        'rol' => 'administrador',
                        'created_at' => new UTCDateTime(),
                        'updated_at' => new UTCDateTime()
                    ];

                    $database->profesores->insertOne($admin);
                    $this->info("Usuario administrador creado exitosamente.");
                } else {
                    $this->warn("El usuario administrador ya existe.");
                }
            } catch (\Exception $e) {
                $this->error("Error al crear administrador: " . $e->getMessage());
            }

            $this->info('Configuración de MongoDB completada exitosamente.');

        } catch (\Exception $e) {
            $this->error("Error de conexión: " . $e->getMessage());
            return 1;
        }
    }
}