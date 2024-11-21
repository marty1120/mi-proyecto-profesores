<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;
use Illuminate\Support\Facades\Hash;

class SeederProfesores extends Seeder
{
    public function run()
    {
        try {
            $dsn = env('MONGODB_DSN');
            $dbName = env('MONGODB_DATABASE', 'profesores');

            $this->command->info("Conectando a la base de datos: $dbName");

            $client = new Client($dsn);
            $database = $client->selectDatabase($dbName);

            if (!$database) {
                throw new \Exception("No se pudo conectar a la base de datos: $dbName");
            }

            $collection = $database->profesores;

            // Limpiar colección existente excepto el admin
            $this->command->info("Limpiando profesores anteriores...");
            $collection->deleteMany(['rol' => 'profesor']);

            // Verificar que existe el administrador
            $admin = $collection->findOne(['email' => 'admin@iesalandalus.org']);
            if (!$admin) {
                $this->command->error("No se encontró el usuario administrador. Por favor, ejecute primero: php artisan mongodb:setup");
                return;
            }

            // Lista de profesores con las URLs de fotos actualizadas
            $profesores = [
                [
                    '_id' => new ObjectId(),
                    'nombre' => 'Juan Pérez',
                    'email' => 'juan@iesalandalus.org',
                    'password' => Hash::make('password'),
                    'departamento' => 'Matemáticas',
                    'foto' => 'https://mighty.tools/mockmind-api/content/human/57.jpg',
                    'fecha_nacimiento' => new UTCDateTime(strtotime('1985-03-15') * 1000),
                    'año_llegada' => 2020,
                    'provincia' => 'Almería',
                    'rol' => 'profesor',
                    'contador_likes' => 0,
                    'created_at' => new UTCDateTime(),
                    'updated_at' => new UTCDateTime()
                ],
                [
                    '_id' => new ObjectId(),
                    'nombre' => 'María García',
                    'email' => 'maria@iesalandalus.org',
                    'password' => Hash::make('password'),
                    'departamento' => 'Lengua y Literatura',
                    'foto' => 'https://mighty.tools/mockmind-api/content/human/44.jpg',
                    'fecha_nacimiento' => new UTCDateTime(strtotime('1990-07-22') * 1000),
                    'año_llegada' => 2019,
                    'provincia' => 'Granada',
                    'rol' => 'profesor',
                    'contador_likes' => 0,
                    'created_at' => new UTCDateTime(),
                    'updated_at' => new UTCDateTime()
                ],
                [
                    '_id' => new ObjectId(),
                    'nombre' => 'Carlos Rodríguez',
                    'email' => 'carlos@iesalandalus.org',
                    'password' => Hash::make('password'),
                    'departamento' => 'Ciencias',
                    'foto' => 'https://mighty.tools/mockmind-api/content/human/5.jpg',
                    'fecha_nacimiento' => new UTCDateTime(strtotime('1988-11-30') * 1000),
                    'año_llegada' => 2021,
                    'provincia' => 'Sevilla',
                    'rol' => 'profesor',
                    'contador_likes' => 0,
                    'created_at' => new UTCDateTime(),
                    'updated_at' => new UTCDateTime()
                ],
                [
                    '_id' => new ObjectId(),
                    'nombre' => 'Ana Martínez',
                    'email' => 'ana@iesalandalus.org',
                    'password' => Hash::make('password'),
                    'departamento' => 'Historia',
                    'foto' => 'https://mighty.tools/mockmind-api/content/human/68.jpg',
                    'fecha_nacimiento' => new UTCDateTime(strtotime('1992-05-18') * 1000),
                    'año_llegada' => 2018,
                    'provincia' => 'Málaga',
                    'rol' => 'profesor',
                    'contador_likes' => 0,
                    'created_at' => new UTCDateTime(),
                    'updated_at' => new UTCDateTime()
                ],
                [
                    '_id' => new ObjectId(),
                    'nombre' => 'Luis Sánchez',
                    'email' => 'luis@iesalandalus.org',
                    'password' => Hash::make('password'),
                    'departamento' => 'Informática',
                    'foto' => 'https://mighty.tools/mockmind-api/content/human/60.jpg',
                    'fecha_nacimiento' => new UTCDateTime(strtotime('1987-09-25') * 1000),
                    'año_llegada' => 2022,
                    'provincia' => 'Almería',
                    'rol' => 'profesor',
                    'contador_likes' => 0,
                    'created_at' => new UTCDateTime(),
                    'updated_at' => new UTCDateTime()
                ]
            ];

            foreach ($profesores as $profesor) {
                $collection->insertOne($profesor);
                $this->command->info("Profesor {$profesor['nombre']} creado correctamente");
            }

            // Verificar índices
            $this->command->info("Verificando índices...");
            $indices = $collection->listIndexes();
            $indicesExistentes = [];
            foreach ($indices as $index) {
                $indicesExistentes[] = $index->getName();
            }

            // Verificar cantidad de profesores
            $totalProfesores = $collection->countDocuments(['rol' => 'profesor']);
            $this->command->info("Total de profesores creados: $totalProfesores");

            $this->command->info("Seeding completado exitosamente");

        } catch (\Exception $e) {
            $this->command->error("Error durante el seeding: " . $e->getMessage());
            throw $e;
        }
    }
}