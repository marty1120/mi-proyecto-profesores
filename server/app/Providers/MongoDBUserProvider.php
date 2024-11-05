<?php

namespace App\Auth;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\UserProvider;
use App\Models\Teacher;
use Illuminate\Support\Str;

class MongoDBUserProvider implements UserProvider
{
    public function retrieveById($identifier)
    {
        return Teacher::find($identifier);
    }

    public function retrieveByToken($identifier, $token)
    {
        return Teacher::where('_id', $identifier)
            ->where('remember_token', $token)
            ->first();
    }

    public function updateRememberToken(Authenticatable $user, $token)
    {
        $user->remember_token = $token;
        $user->save();
    }

    public function retrieveByCredentials(array $credentials)
    {
        if (empty($credentials) ||
            (!isset($credentials['email']) && !isset($credentials['username']))) {
            return null;
        }

        return Teacher::where('email', $credentials['email'])->first();
    }

    public function validateCredentials(Authenticatable $user, array $credentials)
    {
        return password_verify($credentials['password'], $user->password);
    }
}