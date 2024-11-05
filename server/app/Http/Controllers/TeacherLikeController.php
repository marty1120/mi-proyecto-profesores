<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\TeacherLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TeacherLikeController extends Controller
{
    public function store(Request $request, $teacherId)
    {
        // Validar la petición
        $request->validate([
            'like_type' => 'required|string',
            'comment' => 'required|string|min:10|max:500'
        ]);

        // Verificar que no se esté dando like a sí mismo
        if ($teacherId == Auth::id()) {
            return response()->json([
                'message' => 'No puedes darte like a ti mismo'
            ], 422);
        }

        // Verificar si ya dio like antes
        $existingLike = TeacherLike::where([
            'teacher_id' => $teacherId,
            'given_by_id' => Auth::id(),
            'like_type' => $request->like_type
        ])->first();

        if ($existingLike) {
            return response()->json([
                'message' => 'Ya has dado un like de este tipo a este profesor'
            ], 422);
        }

        // Crear el nuevo like
        $like = TeacherLike::create([
            'teacher_id' => $teacherId,
            'given_by_id' => Auth::id(),
            'like_type' => $request->like_type,
            'comment' => $request->comment
        ]);

        // Actualizar las habilidades del profesor
        $teacher = Teacher::find($teacherId);
        if (!in_array($request->like_type, $teacher->skills ?? [])) {
            $teacher->push('skills', $request->like_type);
        }

        return response()->json([
            'message' => 'Like agregado correctamente',
            'like' => $like->load(['givenBy:id,name,department'])
        ]);
    }

    public function getLikes($teacherId)
    {
        $likes = TeacherLike::where('teacher_id', $teacherId)
            ->with(['givenBy:id,name,department'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($likes);
    }

    public function getTeacherLikeHistory($teacherId)
    {
        $likes = TeacherLike::where('teacher_id', $teacherId)
            ->with(['givenBy:id,name,department'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy('like_type');

        return response()->json($likes);
    }

    public function getLikeStats($teacherId)
    {
        $stats = TeacherLike::where('teacher_id', $teacherId)
            ->get()
            ->groupBy('like_type')
            ->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'last_received' => $group->max('created_at'),
                    'givers' => $group->pluck('given_by_id')->unique()->count()
                ];
            });

        return response()->json($stats);
    }
}