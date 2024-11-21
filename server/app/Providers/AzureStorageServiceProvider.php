<?php

namespace App\Providers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use League\Flysystem\AzureBlobStorage\AzureBlobStorageAdapter;
use League\Flysystem\Filesystem;
use MicrosoftAzure\Storage\Blob\BlobRestProxy;

class AzureStorageServiceProvider extends ServiceProvider
{
    public function register()
    {
        //
    }

    public function boot()
    {
        Storage::extend('azure', function ($app, $config) {
            $connectionString = 'DefaultEndpointsProtocol=https;'
                . 'AccountName=' . $config['name'] . ';'
                . 'AccountKey=' . $config['key'] . ';'
                . 'EndpointSuffix=core.windows.net';

            $blobClient = BlobRestProxy::createBlobService($connectionString);

            return new Filesystem(new AzureBlobStorageAdapter(
                $blobClient,
                $config['container']
            ));
        });
    }
}