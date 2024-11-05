<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Teacher;
use Illuminate\Http\Request;
use App\Events\GroupCreated;
use App\Events\GroupMemberAdded;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        $query = Group::query();

        // Filtrar por departamento si se especifica
        if ($request->has('department')) {
            $query->where('department', $request->department);
        }

        // Filtrar por tags si se especifican
        if ($request->has('tags')) {
            $tags = explode(',', $request->tags);
            $query->whereIn('tags', $tags);
        }

        // Búsqueda por nombre o descripción
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%");
            });
        }

        $groups = $query->with(['members:_id,name,department'])
                       ->orderBy('created_at', 'desc')
                       ->paginate(10);

        return response()->json($groups);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'tags' => 'array',
            'department' => 'required|string',
            'max_members' => 'integer|min:2|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $group = Group::create([
            'name' => $request->name,
            'description' => $request->description,
            'creator_id' => auth()->id(),
            'tags' => $request->tags ?? [],
            'department' => $request->department,
            'max_members' => $request->max_members ?? 20,
            'is_active' => true
        ]);

        // Agregar al creador como admin del grupo
        $group->addMember(auth()->user(), 'admin');

        // Disparar evento de grupo creado
        event(new GroupCreated($group));

        return response()->json($group, 201);
    }

    public function show(Group $group)
    {
        $group->load(['members:_id,name,department', 'messages' => function($query) {
            $query->latest()->take(50)->with('sender:_id,name,department');
        }]);

        return response()->json($group);
    }

    public function join(Request $request, Group $group)
    {
        $teacher = auth()->user();

        if ($group->isMember($teacher)) {
            return response()->json(['message' => 'Ya eres miembro de este grupo'], 422);
        }

        if ($group->members()->count() >= $group->max_members) {
            return response()->json(['message' => 'El grupo está lleno'], 422);
        }

        $group->addMember($teacher);
        event(new GroupMemberAdded($group, $teacher));

        return response()->json(['message' => 'Te has unido al grupo exitosamente']);
    }

    public function leave(Group $group)
    {
        $teacher = auth()->user();

        if (!$group->isMember($teacher)) {
            return response()->json(['message' => 'No eres miembro de este grupo'], 422);
        }

        if ($group->isAdmin($teacher) && $group->members()->wherePivot('role', 'admin')->count() === 1) {
            return response()->json(['message' => 'Debes asignar otro administrador antes de salir'], 422);
        }

        $group->removeMember($teacher);

        return response()->json(['message' => 'Has salido del grupo exitosamente']);
    }

    public function update(Request $request, Group $group)
    {
        if (!$group->isAdmin(auth()->user())) {
            return response()->json(['message' => 'No tienes permisos para editar este grupo'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'description' => 'string',
            'tags' => 'array',
            'max_members' => 'integer|min:2|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $group->update($request->all());

        return response()->json($group);
    }

    public function destroy(Group $group)
    {
        if (!$group->isAdmin(auth()->user())) {
            return response()->json(['message' => 'No tienes permisos para eliminar este grupo'], 403);
        }

        $group->delete();

        return response()->json(['message' => 'Grupo eliminado exitosamente']);
    }
}