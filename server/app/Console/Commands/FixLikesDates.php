<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;

class FixLikesDates extends Command
{
    protected $signature = 'likes:fix-dates';
    protected $description = 'Corrige las fechas inválidas en los likes';

    public function handle()
    {
        try {
            $client = new Client(env('MONGODB_DSN'));
            $database = $client->selectDatabase(env('MONGODB_DATABASE'));
            $likesCollection = $database->likes;

            $this->info('Buscando likes con fechas inválidas...');

            // Encontrar todos los likes con fechas inválidas o sin fecha
            $likes = $likesCollection->find([
                '$or' => [
                    ['created_at' => ['$exists' => false]],
                    ['created_at' => null],
                    ['created_at' => '']
                ]
            ]);

            $count = 0;
            foreach ($likes as $like) {
                // Actualizar con la fecha actual
                $likesCollection->updateOne(
                    ['_id' => $like->_id],
                    ['$set' => [
                        'created_at' => new UTCDateTime(),
                        'updated_at' => new UTCDateTime()
                    ]]
                );
                $count++;
                $this->output->write("\rLikes actualizados: " . $count);
            }

            $this->newLine();
            $this->info("Proceso completado. Se actualizaron $count likes.");

        } catch (\Exception $e) {
            $this->error('Error: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}