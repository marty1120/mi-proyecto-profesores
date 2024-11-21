<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;
use Illuminate\Support\Str;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        try {
            Log::info('Intento de login', ['email' => $request->email]);

            // Validar datos de entrada
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                Log::warning('Error de validación en login', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => 'Datos de entrada inválidos',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Conectar directamente a MongoDB
            $mongoClient = new MongoClient(env('MONGODB_DSN'));
            $database = $mongoClient->selectDatabase(env('MONGODB_DATABASE', 'profesores'));
            $collection = $database->profesores;

            // Buscar usuario por email
            $user = $collection->findOne(['email' => $request->email]);

            if (!$user) {
                Log::info('Usuario no encontrado', ['email' => $request->email]);
                return response()->json(['message' => 'Credenciales incorrectas'], 401);
            }

            // Verificar contraseña
            if (!Hash::check($request->password, $user->password)) {
                Log::warning('Contraseña incorrecta', ['email' => $request->email]);
                return response()->json(['message' => 'Credenciales incorrectas'], 401);
            }

            // Generar token
            $token = Str::random(60);
            $hashedToken = hash('sha256', $token);

            // Guardar token
            $tokensCollection = $database->tokens;
            $tokenResult = $tokensCollection->insertOne([
                'user_id' => $user->_id,
                'token' => $hashedToken,
                'created_at' => new \MongoDB\BSON\UTCDateTime()
            ]);

            $userResponse = [
                'id' => (string)$user->_id,
                'nombre' => $user->nombre,
                'email' => $user->email,
                'rol' => $user->rol,
                'departamento' => $user->departamento ?? null
            ];

            Log::info('Login exitoso', ['user_id' => (string)$user->_id]);

            return response()->json([
                'token' => $token,
                'user' => $userResponse
            ]);

        } catch (\Exception $e) {
            Log::error('Error en login: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(['message' => 'Error en el servidor'], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json(['message' => 'Token no proporcionado'], 400);
            }

            $hashedToken = hash('sha256', $token);

            $mongoClient = new MongoClient(env('MONGODB_DSN'));
            $database = $mongoClient->selectDatabase(env('MONGODB_DATABASE', 'profesores'));
            $tokensCollection = $database->tokens;

            $deleteResult = $tokensCollection->deleteOne(['token' => $hashedToken]);

            if ($deleteResult->getDeletedCount() === 0) {
                return response()->json(['message' => 'Token no válido'], 400);
            }

            return response()->json(['message' => 'Sesión cerrada correctamente']);

        } catch (\Exception $e) {
            Log::error('Error en logout: ' . $e->getMessage());
            return response()->json(['message' => 'Error al cerrar sesión'], 500);
        }
    }

    public function me(Request $request)
    {
        try {
            $token = $request->bearerToken();
            if (!$token) {
                return response()->json(['message' => 'No autenticado'], 401);
            }

            $hashedToken = hash('sha256', $token);

            $mongoClient = new MongoClient(env('MONGODB_DSN'));
            $database = $mongoClient->selectDatabase(env('MONGODB_DATABASE', 'profesores'));
            
            // Buscar el token
            $tokenDoc = $database->tokens->findOne(['token' => $hashedToken]);
            if (!$tokenDoc) {
                return response()->json(['message' => 'Token no válido'], 401);
            }

            // Buscar el usuario
            $user = $database->profesores->findOne(['_id' => $tokenDoc->user_id]);
            if (!$user) {
                return response()->json(['message' => 'Usuario no encontrado'], 404);
            }

            return response()->json([
                'id' => (string)$user->_id,
                'nombre' => $user->nombre,
                'email' => $user->email,
                'rol' => $user->rol,
                'departamento' => $user->departamento ?? null
            ]);

        } catch (\Exception $e) {
            Log::error('Error en me: ' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener usuario'], 500);
        }
    }
}