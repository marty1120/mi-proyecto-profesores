<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Teacher;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required'
            ]);

            $credentials = $request->only('email', 'password');

            if (!Auth::attempt($credentials)) {
                return response()->json([
                    'message' => 'Credenciales incorrectas'
                ], 401);
            }

            $profesor = Teacher::where('email', $request->email)->first();
            $token = $profesor->createToken('auth_token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $profesor->_id,
                    'nombre' => $profesor->nombre,
                    'email' => $profesor->email,
                    'rol' => $profesor->rol
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error en login: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error en el servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function me(Request $request)
    {
        try {
            return response()->json($request->user());
        } catch (\Exception $e) {
            Log::error('Error en me: ' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener el usuario'], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->tokens()->delete();
            return response()->json(['message' => 'Sesión cerrada correctamente']);
        } catch (\Exception $e) {
            Log::error('Error en logout: ' . $e->getMessage());
            return response()->json(['message' => 'Error al cerrar sesión'], 500);
        }
    }
}