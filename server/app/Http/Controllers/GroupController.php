<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use MongoDB\BSON\ObjectId;

class GroupController extends Controller
{
    public function index(Request $request)
    {
        try {
            Log::info('Obteniendo grupos');

            $query = Group::query();

            // Aplicar filtros si existen
            if ($request->has('department')) {
                $query->where('department', 'like', '%' . $request->department . '%');
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where('name', 'like', '%' . $search . '%');
            }

            $grupos = $query->get()->map(function ($grupo) use ($request) {
                $creator = null;
                if (isset($grupo->creator_id)) {
                    $creator = Teacher::find($grupo->creator_id);
                }

                $user = $request->get('user');
                $userId = $user['id'] ?? null;

                $isMember = $userId ? $grupo->isMember($userId) : false;
                $isAdmin = $userId ? $grupo->isAdmin($user) : false;
                $memberRole = $userId ? $grupo->getMemberRole($userId) : null;

                $groupArray = $grupo->toArray();
                $groupArray['creator'] = $creator ? $creator->toArray() : null;
                $groupArray['isMember'] = $isMember;
                $groupArray['isAdmin'] = $isAdmin;
                $groupArray['memberRole'] = $memberRole;

                return $groupArray;
            });

            return response()->json($grupos);

        } catch (\Exception $e) {
            Log::error('Error obteniendo grupos: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(['error' => 'Error al obtener los grupos'], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Creando nuevo grupo', $request->all());

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'department' => 'required|string',
                'tags' => 'array',
            ]);

            $user = $request->get('user');

            $grupo = new Group();
            $grupo->name = $validated['name'];
            $grupo->description = $validated['description'];
            $grupo->department = $validated['department'];
            $grupo->tags = $validated['tags'] ?? [];
            $grupo->creator_id = new ObjectId($user['id']);
            $grupo->is_active = true;
            $grupo->members = [
                [
                    'id' => (string)$user['id'],
                    'name' => $user['nombre'],
                    'department' => $user['departamento'],
                    'role' => 'admin'
                ]
            ];

            $grupo->save();

            $groupArray = $grupo->toArray();

            return response()->json($groupArray, 201);

        } catch (\Exception $e) {
            Log::error('Error creando grupo: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(['error' => 'Error al crear el grupo'], 500);
        }
    }

    public function show(Request $request, $id)
{
    try {
        Log::info('Obteniendo grupo con ID: ' . $id);
        
        $group = Group::findOrFail($id);
        Log::info('Grupo encontrado:', ['group' => $group->toArray()]);
        
        $user = $request->get('user');
        Log::info('Usuario actual:', ['user' => $user]);

        // Verificar rol del usuario
        $isMember = $group->isMember($user['id'] ?? null);
        $isAdmin = $group->isAdmin($user);
        $memberRole = $group->getMemberRole($user['id'] ?? null);

        // Asegurarse de que members es un array
        $members = $group->members ?? [];
        if (!is_array($members)) {
            $members = [];
        }

        $groupArray = $group->toArray();
        $groupArray['isMember'] = $isMember;
        $groupArray['isAdmin'] = $isAdmin;
        $groupArray['memberRole'] = $memberRole;
        $groupArray['members'] = $members;

        Log::info('Datos a enviar:', ['group' => $groupArray]);
        Log::info('Miembros a enviar:', ['members' => $groupArray['members']]);

        return response()->json($groupArray);

    } catch (\Exception $e) {
        Log::error('Error obteniendo grupo: ' . $e->getMessage());
        Log::error($e->getTraceAsString());
        return response()->json(['error' => 'Error al obtener el grupo'], 500);
    }
}

    public function update(Request $request, $id)
    {
        try {
            $group = Group::findOrFail($id);
            $user = $request->get('user');

            if (!$group->isAdmin($user)) {
                return response()->json(['message' => 'No tienes permisos para editar este grupo'], 403);
            }

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'department' => 'sometimes|string',
                'tags' => 'sometimes|array',
                // 'max_members' => 'sometimes|integer|min:2|max:50' // Eliminado
            ]);

            $group->fill($validated);
            $group->save();

            return response()->json($group->toArray());

        } catch (\Exception $e) {
            Log::error('Error actualizando grupo: ' . $e->getMessage());
            return response()->json(['error' => 'Error al actualizar el grupo'], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            $group = Group::findOrFail($id);
            $user = $request->get('user');

            if (!$group->isAdmin($user)) {
                return response()->json(['message' => 'No tienes permisos para eliminar este grupo'], 403);
            }

            $group->delete();

            return response()->json(['message' => 'Grupo eliminado exitosamente']);

        } catch (\Exception $e) {
            Log::error('Error eliminando grupo: ' . $e->getMessage());
            return response()->json(['error' => 'Error al eliminar el grupo'], 500);
        }
    }

    public function join(Request $request, $id)
    {
        try {
            $group = Group::findOrFail($id);
            $user = $request->get('user');

            // Ensure 'members' is an array
            if (!is_array($group->members)) {
                Log::warning('El campo "members" no es un array. Re-inicializando.');
                $group->members = [];
            }

            // Verificar si ya es miembro
            if ($group->isMember($user['id'])) {
                return response()->json(['message' => 'Ya eres miembro de este grupo'], 400);
            }

            // Crear el nuevo miembro
            $newMember = [
                'id' => (string)$user['id'],
                'name' => $user['nombre'],
                'department' => $user['departamento'],
                'role' => 'member'
            ];

            // Obtener la copia actual de members
            $members = $group->members;

            // Añadir el nuevo miembro
            $members[] = $newMember;

            // Asignar de nuevo el array modificado
            $group->members = $members;

            // Guardar los cambios
            $group->save();

            return response()->json(['message' => 'Te has unido al grupo exitosamente']);

        } catch (\Exception $e) {
            Log::error('Error al unirse al grupo: ' . $e->getMessage());
            return response()->json(['message' => 'Error al unirse al grupo'], 500);
        }
    }

    public function leave(Request $request, $id)
    {
        try {
            $group = Group::findOrFail($id);
            $user = $request->get('user');

            if (!$group->isMember($user['id'])) {
                return response()->json(['message' => 'No eres miembro de este grupo'], 400);
            }

            // Si es el único miembro, eliminar el grupo
            if (count($group->members) === 1) {
                $group->delete();
                return response()->json(['message' => 'Has abandonado y eliminado el grupo al ser el último miembro']);
            }

            // Si es admin y es el único, debe transferir el rol antes de salir
            if ($group->isAdmin($user)) {
                $adminCount = collect($group->members)->where('role', 'admin')->count();
                if ($adminCount === 1) {
                    return response()->json([
                        'message' => 'No puedes abandonar el grupo siendo el único administrador. ' .
                                   'Transfiere el rol de administrador a otro miembro primero.'
                    ], 400);
                }
            }

            // Eliminar al miembro
            $group->removeMember($user['id']);

            return response()->json(['message' => 'Has abandonado el grupo exitosamente']);

        } catch (\Exception $e) {
            Log::error('Error al abandonar el grupo: ' . $e->getMessage());
            return response()->json(['error' => 'Error al abandonar el grupo'], 500);
        }
    }


    public function transferAdmin(Request $request, $id)
    {
        try {
            $group = Group::findOrFail($id);
            $user = $request->get('user');
            $newAdminId = $request->input('new_admin_id');

            if (!$group->isAdmin($user)) {
                return response()->json(['message' => 'No tienes permisos para transferir el rol de administrador'], 403);
            }

            if (!$group->isMember($newAdminId)) {
                return response()->json(['message' => 'El usuario seleccionado no es miembro del grupo'], 400);
            }

            // Obtener la copia actual de members
            $members = $group->members;

            // Actualizar rol del nuevo admin
            $members = collect($members)->map(function ($member) use ($newAdminId) {
                if ($member['id'] === $newAdminId) {
                    $member['role'] = 'admin';
                }
                return $member;
            })->toArray();

            // Asignar de nuevo el array modificado
            $group->members = $members;

            // Guardar los cambios
            $group->save();

            return response()->json(['message' => 'Rol de administrador transferido exitosamente']);

        } catch (\Exception $e) {
            Log::error('Error al transferir rol de admin: ' . $e->getMessage());
            return response()->json(['error' => 'Error al transferir rol de administrador'], 500);
        }
    }

    public function updateMemberRole(Request $request, $groupId, $memberId)
{
    try {
        // Validar el request
        $validated = $request->validate([
            'role' => 'required|string|in:member,admin'
        ]);

        $group = Group::findOrFail($groupId);
        $user = $request->get('user');

        // Verificar que el usuario tiene permisos para cambiar roles
        if (!$group->isAdmin($user)) {
            return response()->json([
                'message' => 'No tienes permisos para cambiar roles'
            ], 403);
        }

        // Verificar que el miembro existe en el grupo
        $memberExists = false;
        $isLastAdmin = true;
        $adminCount = 0;
        $updatedMembers = [];

        foreach ($group->members as $member) {
            if ($member['id'] === $memberId) {
                // No permitir cambiar el rol del creador
                if ($group->creator_id == $memberId) {
                    return response()->json([
                        'message' => 'No se puede cambiar el rol del creador del grupo'
                    ], 403);
                }
                
                $memberExists = true;
                $member['role'] = $validated['role'];
            }
            
            if ($member['role'] === 'admin') {
                $adminCount++;
            }
            
            $updatedMembers[] = $member;
        }

        // Verificar que queda al menos un admin
        if ($validated['role'] !== 'admin' && $adminCount < 2) {
            return response()->json([
                'message' => 'Debe haber al menos un administrador en el grupo'
            ], 400);
        }

        if (!$memberExists) {
            return response()->json([
                'message' => 'Miembro no encontrado en el grupo'
            ], 404);
        }

        // Actualizar los roles
        $group->members = $updatedMembers;
        $group->save();

        return response()->json([
            'message' => 'Rol actualizado correctamente',
            'members' => $group->members
        ]);

    } catch (\Exception $e) {
        Log::error('Error actualizando rol de miembro: ' . $e->getMessage());
        return response()->json([
            'message' => 'Error al actualizar el rol'
        ], 500);
    }
}
}

