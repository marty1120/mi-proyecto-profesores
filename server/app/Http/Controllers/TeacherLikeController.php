<?php

namespace App\Http\Controllers;

use App\Models\TeacherLike;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use MongoDB\BSON\ObjectId;
use MongoDB\Client;
use MongoDB\BSON\UTCDateTime;
class TeacherLikeController extends Controller
{
    protected $mongoClient;
    protected $database;

    public function __construct()
    {
        $this->mongoClient = new Client(env('MONGODB_DSN'));
        $this->database = $this->mongoClient->selectDatabase(env('MONGODB_DATABASE'));
    }

    public function store(Request $request, $id)
    {
        try {
            Log::info('Iniciando store de like', [
                'teacher_id' => $id,
                'request_data' => $request->all()
            ]);

            // Validar request
            $validated = $request->validate([
                'category' => 'required|string',
                'subcategory' => 'required|string',
                'comment' => 'required|string|min:10|max:500'
            ]);

            if (!preg_match('/^[0-9a-fA-F]{24}$/', $id)) {
                Log::warning('ID de profesor inválido', ['id' => $id]);
                return response()->json([
                    'message' => 'ID de profesor inválido'
                ], 400);
            }

            // Buscar el profesor en la colección 'profesores'
            $collection = $this->database->profesores;
            $teacher = $collection->findOne(['_id' => new ObjectId($id)]);
            Log::info('Resultado de búsqueda de profesor', ['teacher' => $teacher]);

            if (!$teacher) {
                Log::warning('Profesor no encontrado', ['id' => $id]);
                return response()->json([
                    'message' => 'Profesor no encontrado'
                ], 404);
            }

            // Obtener el usuario autenticado desde el middleware
            $user = $request->get('user');
            Log::info('Usuario autenticado', ['user' => $user]);

            if (!$user) {
                Log::warning('Usuario no autenticado');
                return response()->json([
                    'message' => 'Usuario no autenticado'
                ], 401);
            }

            if ($user['id'] === $id) {
                return response()->json([
                    'message' => 'No puedes darte like a ti mismo'
                ], 422);
            }

            // Verificar si ya existe un like de este usuario a este profesor
            $likesCollection = $this->database->likes;
            $existingLike = $likesCollection->findOne([
                'teacher_id' => new ObjectId($id),
                'given_by_id' => new ObjectId($user['id'])
            ]);

            if ($existingLike) {
                return response()->json([
                    'message' => 'Ya has dado like a este profesor'
                ], 422);
            }

            // Crear el nuevo like
            $likeDocument = [
                'teacher_id' => new ObjectId($id),
                'given_by_id' => new ObjectId($user['id']),
                'category' => $validated['category'],
                'subcategory' => $validated['subcategory'],
                'comment' => $validated['comment'],
                'created_at' => new \MongoDB\BSON\UTCDateTime(),
                'updated_at' => new \MongoDB\BSON\UTCDateTime()
            ];

            $insertResult = $likesCollection->insertOne($likeDocument);
            
            if (!$insertResult->getInsertedId()) {
                throw new \Exception('Error al insertar el like');
            }

            // Actualizar el contador de likes
            $likesCount = $likesCollection->countDocuments([
                'teacher_id' => new ObjectId($id)
            ]);

            // Actualizar el contador en la colección de profesores
            $collection->updateOne(
                ['_id' => new ObjectId($id)],
                ['$set' => ['contador_likes' => $likesCount]]
            );

            // Recuperar el like insertado con el ID
            $insertedLike = $likesCollection->findOne(['_id' => $insertResult->getInsertedId()]);
            $givenBy = $collection->findOne(['_id' => new ObjectId($user['id'])]);

            $response = [
                'message' => 'Like agregado correctamente',
                'like' => [
                    'id' => (string)$insertedLike->_id,
                    'category' => $insertedLike->category,
                    'subcategory' => $insertedLike->subcategory,
                    'comment' => $insertedLike->comment,
                    'created_at' => $insertedLike->created_at,
                    'given_by' => [
                        'id' => (string)$givenBy->_id,
                        'nombre' => $givenBy->nombre,
                        'departamento' => $givenBy->departamento ?? null
                    ]
                ],
                'likes_count' => $likesCount
            ];

            Log::info('Like agregado correctamente', [
                'teacher_id' => $id,
                'like_id' => (string)$insertResult->getInsertedId()
            ]);

            return response()->json($response, 201);

        } catch (\Exception $e) {
            Log::error('Error en store de TeacherLikeController: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'message' => 'Error al procesar el like',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getLikes($id)
    {
        try {
            Log::info('Obteniendo likes', ['teacher_id' => $id]);

            if (!preg_match('/^[0-9a-fA-F]{24}$/', $id)) {
                return response()->json([
                    'message' => 'ID de profesor inválido'
                ], 400);
            }

            $likesCollection = $this->database->likes;
            $collection = $this->database->profesores;

            $likes = $likesCollection->find(['teacher_id' => new ObjectId($id)]);
            $likesArray = [];

            foreach ($likes as $like) {
                $givenBy = $collection->findOne(['_id' => $like->given_by_id]);
                $likesArray[] = [
                    'id' => (string)$like->_id,
                    'category' => $like->category,
                    'subcategory' => $like->subcategory,
                    'comment' => $like->comment,
                    'created_at' => $like->created_at,
                    'given_by' => [
                        'id' => (string)$givenBy->_id,
                        'nombre' => $givenBy->nombre,
                        'departamento' => $givenBy->departamento ?? null
                    ]
                ];
            }

            return response()->json($likesArray);

        } catch (\Exception $e) {
            Log::error('Error getting likes: ' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener likes'], 500);
        }
    }

    public function getTeacherLikeHistory($id)
    {
        try {
            Log::info('Obteniendo historial de likes', ['teacher_id' => $id]);

            if (!preg_match('/^[0-9a-fA-F]{24}$/', $id)) {
                return response()->json([
                    'message' => 'ID de profesor inválido'
                ], 400);
            }

            $likesCollection = $this->database->likes;
            $collection = $this->database->profesores;

            $likes = $likesCollection->find(
                ['teacher_id' => new ObjectId($id)],
                ['sort' => ['created_at' => -1]]
            );

            $likesArray = [];

            foreach ($likes as $like) {
                $givenBy = $collection->findOne(['_id' => $like->given_by_id]);
                $likesArray[] = [
                    'id' => (string)$like->_id,
                    'category' => $like->category,
                    'subcategory' => $like->subcategory,
                    'comment' => $like->comment,
                    'created_at' => $like->created_at,
                    'given_by' => [
                        'id' => (string)$givenBy->_id,
                        'nombre' => $givenBy->nombre,
                        'departamento' => $givenBy->departamento ?? null,
                        'foto' => $givenBy->foto ?? null
                    ]
                ];
            }

            return response()->json($likesArray);

        } catch (\Exception $e) {
            Log::error('Error getting like history: ' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener historial'], 500);
        }
    }

    public function getLikeStats($id)
    {
        try {
            Log::info('Obteniendo estadísticas de likes', ['teacher_id' => $id]);

            if (!preg_match('/^[0-9a-fA-F]{24}$/', $id)) {
                return response()->json([
                    'message' => 'ID de profesor inválido'
                ], 400);
            }

            $likesCollection = $this->database->likes;
            
            // Obtener todos los likes del profesor
            $likes = $likesCollection->find(['teacher_id' => new ObjectId($id)]);
            $stats = [];

            // Calcular estadísticas
            foreach ($likes as $like) {
                $category = $like->category;
                if (!isset($stats[$category])) {
                    $stats[$category] = [
                        'total' => 0,
                        'subcategorias' => []
                    ];
                }

                $subcategory = $like->subcategory;
                if (!isset($stats[$category]['subcategorias'][$subcategory])) {
                    $stats[$category]['subcategorias'][$subcategory] = 0;
                }

                $stats[$category]['total']++;
                $stats[$category]['subcategorias'][$subcategory]++;
            }

            // Calcular progreso para cada categoría
            $progress = [];
            foreach ($stats as $category => $data) {
                $progress[$category] = min(100, 30 + ($data['total'] * 5)); // Base 30 + 5 por cada like
            }

            return response()->json([
                'stats' => $stats,
                'progress' => $progress]);

        } catch (\Exception $e) {
            Log::error('Error getting like stats: ' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener estadísticas'], 500);
        }
    }

    public function getLikesGiven($id)
{
    try {
        Log::info('Obteniendo likes dados por el profesor', ['teacher_id' => $id]);

        if (!preg_match('/^[0-9a-fA-F]{24}$/', $id)) {
            return response()->json([
                'message' => 'ID de profesor inválido'
            ], 400);
        }

        $likesCollection = $this->database->likes;
        $collection = $this->database->profesores;

        // Buscar likes donde el profesor es el que los dio
        $likes = $likesCollection->find(
            ['given_by_id' => new ObjectId($id)],
            ['sort' => ['created_at' => -1]]
        );

        $likesArray = [];

        foreach ($likes as $like) {
            // Obtener el profesor que recibió el like
            $receivingTeacher = $collection->findOne(['_id' => $like->teacher_id]);
            
            if ($receivingTeacher) {
                $likesArray[] = [
                    'id' => (string)$like->_id,
                    'category' => $like->category,
                    'subcategory' => $like->subcategory,
                    'comment' => $like->comment,
                    'created_at' => $like->created_at,
                    'teacher' => [ // El profesor que recibió el like
                        'id' => (string)$receivingTeacher->_id,
                        'nombre' => $receivingTeacher->nombre,
                        'departamento' => $receivingTeacher->departamento ?? null,
                        'foto' => $receivingTeacher->foto ?? null
                    ]
                ];
            }
        }

        return response()->json($likesArray);

    } catch (\Exception $e) {
        Log::error('Error getting likes given: ' . $e->getMessage());
        return response()->json(['message' => 'Error al obtener likes dados'], 500);
    }
}
}