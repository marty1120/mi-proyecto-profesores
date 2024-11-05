<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use MongoDB\Client;
use MongoDB\BSON\ObjectId;

class SeederProfesores extends Seeder
{
    public function run()
    {
        try {
            // Obtenemos la configuración directamente
            $dsn = env('MONGODB_DSN');
            $dbName = env('MONGODB_DATABASE', 'profesores');

            $this->command->info("Conectando a la base de datos: $dbName");

            $client = new Client($dsn);
            $database = $client->selectDatabase($dbName);
            
            if (!$database) {
                throw new \Exception("No se pudo conectar a la base de datos: $dbName");
            }

            $collection = $database->profesores;

            // Limpiamos la colección existente
            $collection->deleteMany([]);

            // Creamos el administrador
            $admin = [
                '_id' => new ObjectId(),
                'nombre' => 'Administrador',
                'email' => 'admin@iesalandalus.org',
                'password' => bcrypt('password'),
                'rol' => 'administrador',
                'created_at' => new \MongoDB\BSON\UTCDateTime(),
                'updated_at' => new \MongoDB\BSON\UTCDateTime()
            ];

            $collection->insertOne($admin);
            $this->command->info("Administrador creado correctamente");

            // Luego creamos los profesores
            $profesores = [
                [
                    '_id' => new ObjectId(),
                    'nombre' => 'Juan Pérez',
                    'email' => 'juan@iesalandalus.org',
                    'password' => bcrypt('password'),
                    'departamento' => 'Matemáticas',
                    'foto' => 'https://randomuser.me/api/portraits/men/1.jpg',
                    'fecha_nacimiento' => '1985-03-15',
                    'año_llegada' => '2020',
                    'provincia' => 'Almería',
                    'rol' => 'profesor',
                    'contador_likes' => 0,
                    'habilidades' => [],
                    'created_at' => new \MongoDB\BSON\UTCDateTime(),
                    'updated_at' => new \MongoDB\BSON\UTCDateTime()
                ],
                [
                    '_id' => new ObjectId(),
                    'nombre' => 'María García',
                    'email' => 'maria@iesalandalus.org',
                    'password' => bcrypt('password'),
                    'departamento' => 'Literatura',
                    'foto' => 'https://randomuser.me/api/portraits/women/1.jpg',
                    'fecha_nacimiento' => '1990-07-22',
                    'año_llegada' => '2019',
                    'provincia' => 'Granada',
                    'rol' => 'profesor',
                    'contador_likes' => 0,
                    'habilidades' => [],
                    'created_at' => new \MongoDB\BSON\UTCDateTime(),
                    'updated_at' => new \MongoDB\BSON\UTCDateTime()
                ],
                [
                    '_id' => new ObjectId(),
                    'nombre' => 'Carlos Rodríguez',
                    'email' => 'carlos@iesalandalus.org',
                    'password' => bcrypt('password'),
                    'departamento' => 'Ciencias',
                    'foto' => 'https://randomuser.me/api/portraits/men/2.jpg',
                    'fecha_nacimiento' => '1988-11-30',
                    'año_llegada' => '2021',
                    'provincia' => 'Almería',
                    'rol' => 'profesor',
                    'contador_likes' => 0,
                    'habilidades' => [],
                    'created_at' => new \MongoDB\BSON\UTCDateTime(),
                    'updated_at' => new \MongoDB\BSON\UTCDateTime()
                ],
                [
                    '_id' => new ObjectId(),
                    'nombre' => 'Ana Martínez',
                    'email' => 'ana@iesalandalus.org',
                    'password' => bcrypt('password'),
                    'departamento' => 'Historia',
                    'foto' => 'https://randomuser.me/api/portraits/women/2.jpg',
                    'fecha_nacimiento' => '1992-05-18',
                    'año_llegada' => '2018',
                    'provincia' => 'Sevilla',
                    'rol' => 'profesor',
                    'contador_likes' => 0,
                    'habilidades' => [],
                    'created_at' => new \MongoDB\BSON\UTCDateTime(),
                    'updated_at' => new \MongoDB\BSON\UTCDateTime()
                ],
                [
                    '_id' => new ObjectId(),
                    'nombre' => 'David López',
                    'email' => 'david@iesalandalus.org',
                    'password' => bcrypt('password'),
                    'departamento' => 'Educación Física',
                    'foto' => 'https://randomuser.me/api/portraits/men/3.jpg',
                    'fecha_nacimiento' => '1987-09-25',
                    'año_llegada' => '2022',
                    'provincia' => 'Málaga',
                    'rol' => 'profesor',
                    'contador_likes' => 0,
                    'habilidades' => [],
                    'created_at' => new \MongoDB\BSON\UTCDateTime(),
                    'updated_at' => new \MongoDB\BSON\UTCDateTime()
                ],
            ];

            foreach ($profesores as $profesorData) {
                try {
                    $collection->insertOne($profesorData);
                    $this->command->info("Profesor {$profesorData['nombre']} creado correctamente");
                } catch (\Exception $e) {
                    $this->command->error("Error creando profesor {$profesorData['nombre']}: " . $e->getMessage());
                }
            }

            $this->command->info('Todos los usuarios han sido creados exitosamente.');

        } catch (\Exception $e) {
            $this->command->error("Error de conexión: " . $e->getMessage());
            throw $e; // Re-lanzamos la excepción para ver el stack trace completo
        }
    }
}