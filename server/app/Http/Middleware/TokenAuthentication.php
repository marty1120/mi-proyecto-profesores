<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;
use Illuminate\Support\Facades\Log;

class TokenAuthentication
{
    public function handle(Request $request, Closure $next)
    {
        try {
            $token = $request->bearerToken();

            if (!$token) {
                Log::warning('Token no proporcionado');
                return response()->json(['message' => 'Token no proporcionado'], 401);
            }

            $hashedToken = hash('sha256', $token);

            // Conectar a MongoDB
            $mongoClient = new MongoClient(env('MONGODB_DSN'));
            $database = $mongoClient->selectDatabase(env('MONGODB_DATABASE', 'profesores'));
            
            // Buscar token
            $tokenDoc = $database->tokens->findOne(['token' => $hashedToken]);
            if (!$tokenDoc) {
                Log::warning('Token inválido');
                return response()->json(['message' => 'Token inválido'], 401);
            }

            // Buscar usuario
            $user = $database->profesores->findOne(['_id' => $tokenDoc->user_id]);
            if (!$user) {
                Log::warning('Usuario no encontrado con token');
                return response()->json(['message' => 'Usuario no encontrado'], 401);
            }

            // Determinar si el usuario es administrador global
            $isGlobalAdmin = isset($user->rol) && $user->rol === 'administrador';

            // Agregar usuario a la request
            $request->attributes->set('user', [
                'id' => (string)$user->_id,
                'nombre' => $user->nombre,
                'email' => $user->email,
                'rol' => $user->rol,
                'departamento' => $user->departamento ?? null,
                'is_global_admin' => $isGlobalAdmin, // Agregar este atributo
            ]);

            return $next($request);

        } catch (\Exception $e) {
            Log::error('Error en middleware de autenticación: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Error en el servidor'], 500);
        }
    }
}
