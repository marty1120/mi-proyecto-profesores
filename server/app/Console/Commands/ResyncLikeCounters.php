<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use MongoDB\Client;

class ResyncLikeCounters extends Command
{
    protected $signature = 'likes:resync';
    protected $description = 'Resincroniza los contadores de likes de todos los profesores';

    public function handle()
    {
        $client = new Client(env('MONGODB_DSN'));
        $database = $client->selectDatabase(env('MONGODB_DATABASE'));
        $profesores = $database->profesores;
        $likes = $database->likes;

        $count = 0;
        foreach ($profesores->find() as $profesor) {
            $likesCount = $likes->countDocuments(['teacher_id' => $profesor->_id]);
            
            $profesores->updateOne(
                ['_id' => $profesor->_id],
                ['$set' => ['contador_likes' => $likesCount]]
            );
            
            $count++;
            $this->info("Profesor {$profesor->nombre}: {$likesCount} likes");
        }

        $this->info("Se actualizaron {$count} profesores");
    }
}