<?php

namespace App\Providers;

use App\Providers\MongoDBUserProvider;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Auth;

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