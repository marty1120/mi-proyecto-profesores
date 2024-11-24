<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use Illuminate\Support\Facades\Log;
use MongoDB\BSON\UTCDateTime;

class AdminLikeController extends Controller
{
    protected $database;
    protected $likesCollection;
    protected $teachersCollection;

    public function __construct()
    {
        $client = new Client(env('MONGODB_DSN'));
        $this->database = $client->selectDatabase(env('MONGODB_DATABASE'));
        $this->likesCollection = $this->database->likes;
        $this->teachersCollection = $this->database->profesores;
    }

    public function index(Request $request)
    {
        try {
            $page = $request->get('page', 1);
            $perPage = 10;
            $skip = ($page - 1) * $perPage;
    
            $likes = $this->likesCollection->find(
                [],
                [
                    'limit' => $perPage,
                    'skip' => $skip,
                    'sort' => ['created_at' => -1]
                ]
            )->toArray();
    
            $total = $this->likesCollection->countDocuments();
    
            $enrichedLikes = array_map(function($like) {
                $teacher = $this->teachersCollection->findOne(
                    ['_id' => $like->teacher_id],
                    ['projection' => ['nombre' => 1, 'departamento' => 1]]
                );
    
                $givenBy = $this->teachersCollection->findOne(
                    ['_id' => $like->given_by_id],
                    ['projection' => ['nombre' => 1, 'departamento' => 1]]
                );
    
                // Convertir la fecha correctamente
                $createdAt = null;
                if (isset($like->created_at)) {
                    if ($like->created_at instanceof \MongoDB\BSON\UTCDateTime) {
                        $createdAt = $like->created_at->toDateTime()->format('Y-m-d H:i:s');
                    } else if (is_string($like->created_at)) {
                        $createdAt = date('Y-m-d H:i:s', strtotime($like->created_at));
                    }
                }
    
                return [
                    'id' => (string)$like->_id,
                    'category' => $like->category,
                    'subcategory' => $like->subcategory,
                    'comment' => $like->comment,
                    'created_at' => $createdAt,
                    'teacher' => $teacher ? [
                        'id' => (string)$teacher->_id,
                        'nombre' => $teacher->nombre,
                        'departamento' => $teacher->departamento
                    ] : null,
                    'given_by' => $givenBy ? [
                        'id' => (string)$givenBy->_id,
                        'nombre' => $givenBy->nombre,
                        'departamento' => $givenBy->departamento
                    ] : null
                ];
            }, $likes);
    
            return response()->json([
                'data' => $enrichedLikes,
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => ceil($total / $perPage),
                'has_more' => $total > ($page * $perPage)
            ]);
    
        } catch (\Exception $e) {
            Log::error('Error al obtener likes para moderación: ' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener likes'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'comment' => 'required|string|min:10|max:500'
            ]);

            if (!preg_match('/^[0-9a-fA-F]{24}$/', $id)) {
                return response()->json(['message' => 'ID de like inválido'], 400);
            }

            // Verificar que el usuario es administrador
            $user = $request->get('user');
            if ($user['rol'] !== 'administrador') {
                return response()->json(['message' => 'No autorizado'], 403);
            }

            $result = $this->likesCollection->updateOne(
                ['_id' => new ObjectId($id)],
                ['$set' => [
                    'comment' => $request->comment,
                    'moderated_at' => new \MongoDB\BSON\UTCDateTime(),
                    'moderated_by' => new ObjectId($user['id'])
                ]]
            );

            if ($result->getModifiedCount() === 0) {
                return response()->json(['message' => 'Like no encontrado'], 404);
            }

            return response()->json(['message' => 'Comentario actualizado correctamente']);

        } catch (\Exception $e) {
            Log::error('Error al actualizar like: ' . $e->getMessage());
            return response()->json(['message' => 'Error al actualizar el comentario'], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        try {
            if (!preg_match('/^[0-9a-fA-F]{24}$/', $id)) {
                return response()->json(['message' => 'ID de like inválido'], 400);
            }
    
            // Primero obtener el like para saber a qué profesor pertenece
            $like = $this->likesCollection->findOne(['_id' => new ObjectId($id)]);
            
            if (!$like) {
                return response()->json(['message' => 'Like no encontrado'], 404);
            }
    
            // Eliminar el like
            $result = $this->likesCollection->deleteOne(['_id' => new ObjectId($id)]);
    
            if ($result->getDeletedCount() === 0) {
                return response()->json(['message' => 'Error al eliminar el like'], 500);
            }
    
            // Obtener el nuevo total de likes para este profesor
            $newLikeCount = $this->likesCollection->countDocuments([
                'teacher_id' => $like->teacher_id
            ]);
    
            // Actualizar el contador en el documento del profesor
            $this->teachersCollection->updateOne(
                ['_id' => $like->teacher_id],
                ['$set' => ['contador_likes' => $newLikeCount]]
            );
    
            return response()->json(['message' => 'Like eliminado correctamente']);
    
        } catch (\Exception $e) {
            Log::error('Error al eliminar like: ' . $e->getMessage());
            return response()->json(['message' => 'Error al eliminar el like'], 500);
        }
    }
}