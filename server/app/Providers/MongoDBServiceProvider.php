<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;
use App\Providers\MongoDBUserProvider;

class MongoDBServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot()
    {
        Auth::provider('mongodb', function ($app, array $config) {
            return new MongoDBUserProvider();
        });
    }
}