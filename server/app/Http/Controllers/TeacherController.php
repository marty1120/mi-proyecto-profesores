<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TeacherController extends Controller
{
    public function index()
{
    try {
        $profesores = Teacher::where('rol', 'profesor')
            ->get()
            ->map(function ($profesor) {
                return [
                    'id' => (string)$profesor->_id,
                    'nombre' => $profesor->nombre,
                    'departamento' => $profesor->departamento,
                    'foto' => $profesor->foto,
                    'likes' => $profesor->contador_likes,
                    'habilidades' => $profesor->habilidades ?? [],
                    'año_llegada' => $profesor->año_llegada,
                    'provincia' => $profesor->provincia
                ];
            });

        return response()->json($profesores);
    } catch (\Exception $e) {
        \Log::error('Error obteniendo profesores: ' . $e->getMessage());
        return response()->json(['error' => 'Error obteniendo los profesores'], 500);
    }
}
    public function show($id)
    {
        try {
            $profesor = Teacher::find($id);
            
            if (!$profesor || $profesor->rol === 'administrador') {
                return response()->json(['message' => 'Profesor no encontrado'], 404);
            }

            return response()->json([
                'id' => $profesor->_id,
                'nombre' => $profesor->nombre,
                'departamento' => $profesor->departamento,
                'foto' => $profesor->foto,
                'likes' => $profesor->contador_likes,
                'habilidades' => $profesor->habilidades ?? [],
                'año_llegada' => $profesor->año_llegada,
                'provincia' => $profesor->provincia,
                'fecha_nacimiento' => $profesor->fecha_nacimiento
            ]);
        } catch (\Exception $e) {
            Log::error('Error obteniendo profesor: ' . $e->getMessage());
            return response()->json(['error' => 'Error obteniendo el profesor'], 500);
        }
    }

    public function addLike(Request $request, $id)
    {
        try {
            $profesor = Teacher::find($id);
            if (!$profesor) {
                return response()->json(['message' => 'Profesor no encontrado'], 404);
            }

            $profesor->increment('contador_likes');
            
            if (!in_array($request->tipo_habilidad, $profesor->habilidades ?? [])) {
                $profesor->push('habilidades', $request->tipo_habilidad);
            }

            return response()->json($profesor);
        } catch (\Exception $e) {
            Log::error('Error añadiendo like: ' . $e->getMessage());
            return response()->json(['error' => 'Error al dar like'], 500);
        }
    }
}