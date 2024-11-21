<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class TeacherController extends Controller
{
    private $database;
    private $collection;

    public function __construct()
    {
        $client = new Client(env('MONGODB_DSN'));
        $this->database = $client->selectDatabase(env('MONGODB_DATABASE'));
        $this->collection = $this->database->profesores;
    }

    private function handleImageUpload($file, $oldImageUrl = null)
{
    try {
        // Validar que el archivo sea una imagen válida
        if (!$file->isValid()) {
            throw new \Exception('El archivo de imagen no es válido');
        }

        // Si hay una imagen anterior y no es un placeholder, intentar eliminarla
        if ($oldImageUrl && !str_contains($oldImageUrl, 'mockmind-api')) {
            try {
                if (config('app.env') === 'production') {
                    $oldPath = str_replace(env('AZURE_STORAGE_URL') . '/' . env('AZURE_STORAGE_CONTAINER') . '/', '', $oldImageUrl);
                    Storage::disk('azure')->delete($oldPath);
                } else {
                    $oldPath = str_replace('/storage/', '', $oldImageUrl);
                    Storage::disk('public')->delete($oldPath);
                }
            } catch (\Exception $e) {
                Log::warning('No se pudo eliminar la imagen anterior: ' . $e->getMessage());
            }
        }

        // Generar nombre único para el archivo
        $fileName = 'profesores/' . uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();

        // Determinar el disco a usar
        $disk = config('app.env') === 'production' ? 'azure' : 'public';
        Log::info('Usando disco de almacenamiento: ' . $disk, [
            'env' => config('app.env'),
            'fileName' => $fileName
        ]);

        if ($disk === 'azure') {
            // Para producción - Azure Storage
            $success = Storage::disk('azure')->put(
                $fileName,
                file_get_contents($file->getRealPath()),
                'public'
            );
            
            if (!$success) {
                throw new \Exception('No se pudo subir el archivo a Azure Storage');
            }
            
            // Construir la URL manualmente para Azure
            $url = env('AZURE_STORAGE_URL') . '/' . env('AZURE_STORAGE_CONTAINER') . '/' . $fileName;
        } else {
            // Para desarrollo - Almacenamiento local
            $path = Storage::disk('public')->putFileAs(
                'profesores',
                $file,
                basename($fileName)
            );
            
            if (!$path) {
                throw new \Exception('No se pudo guardar el archivo en el almacenamiento local');
            }
            
            // Construir la URL para almacenamiento local
            $url = '/storage/' . $path;
        }

        Log::info('Archivo subido exitosamente', ['url' => $url]);
        return $url;

    } catch (\Exception $e) {
        Log::error('Error al procesar la imagen: ' . $e->getMessage());
        Log::error($e->getTraceAsString());
        throw new \Exception('Error al procesar la imagen: ' . $e->getMessage());
    }
}

private function formatTeacherResponse($teacher)
{
    $likesCount = isset($teacher->_id) ? 
        $this->database->likes->countDocuments(['teacher_id' => $teacher->_id]) : 0;

    // Simplificar el manejo de la foto
    $foto = $teacher->foto;
    if ($foto && !str_starts_with($foto, 'http')) {
        $foto = config('app.url') . $foto;
    }

    return [
        'id' => (string)$teacher->_id,
        'nombre' => $teacher->nombre ?? 'Nombre no disponible',
        'email' => $teacher->email ?? null,
        'departamento' => $teacher->departamento ?? 'Departamento no disponible',
        'foto' => $foto, // Si es null, el frontend manejará el avatar predeterminado
        'likes' => $likesCount,
        'contador_likes' => $likesCount,
        'año_llegada' => (int)($teacher->año_llegada ?? 0),
        'provincia' => $teacher->provincia ?? 'Provincia no disponible',
        'fecha_nacimiento' => isset($teacher->fecha_nacimiento) ? 
            $teacher->fecha_nacimiento->toDateTime()->format('Y-m-d') : null
    ];
}

    public function index()
    {
        try {
            Log::info('Obteniendo lista de profesores');
            
            $profesores = $this->collection->find(['rol' => 'profesor'])->toArray();
            
            $formattedProfesores = array_map(function($profesor) {
                return $this->formatTeacherResponse($profesor);
            }, $profesores);

            Log::info('Datos de profesores formateados:', [
                'muestra' => array_slice($formattedProfesores, 0, 2)
            ]);

            return response()->json($formattedProfesores);

        } catch (\Exception $e) {
            Log::error('Error obteniendo profesores: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(['error' => 'Error obteniendo los profesores'], 500);
        }
    }

    public function show($id)
    {
        try {
            Log::info('Buscando profesor con ID: ' . $id);

            if (!preg_match('/^[0-9a-fA-F]{24}$/', $id)) {
                return response()->json(['message' => 'ID de profesor inválido'], 400);
            }

            $profesor = $this->collection->findOne(
                ['_id' => new ObjectId($id), 'rol' => 'profesor']
            );

            if (!$profesor) {
                return response()->json(['message' => 'Profesor no encontrado'], 404);
            }

            $response = $this->formatTeacherResponse($profesor);

            Log::info('Datos del profesor encontrado:', [
                'id' => (string)$profesor->_id,
                'email' => $profesor->email ?? 'No email found'
            ]);

            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Error obteniendo profesor: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json(['error' => 'Error obteniendo el profesor'], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            Log::info('Actualizando perfil de profesor', ['id' => $id]);

            if (!preg_match('/^[0-9a-fA-F]{24}$/', $id)) {
                return response()->json(['message' => 'ID de profesor inválido'], 400);
            }

            // Verificar autorización
            $user = $request->get('user');
            if ($user['id'] !== $id) {
                return response()->json(['message' => 'No autorizado para editar este perfil'], 403);
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'departamento' => 'required|string|max:255',
                'provincia' => 'nullable|string|max:255',
                'año_llegada' => 'nullable|integer|min:1900|max:' . date('Y'),
                'telefono' => 'nullable|string|max:20',
                'foto' => 'nullable|image|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = [
                'nombre' => $request->nombre,
                'departamento' => $request->departamento,
                'provincia' => $request->provincia,
                'año_llegada' => $request->año_llegada ? (int)$request->año_llegada : null,
                'telefono' => $request->telefono,
                'updated_at' => new UTCDateTime()
            ];

            if ($request->hasFile('foto')) {
                $profesor = $this->collection->findOne(['_id' => new ObjectId($id)]);
                try {
                    $updateData['foto'] = $this->handleImageUpload(
                        $request->file('foto'),
                        $profesor->foto ?? null
                    );
                } catch (\Exception $e) {
                    return response()->json([
                        'message' => 'Error al procesar la imagen',
                        'error' => $e->getMessage()
                    ], 500);
                }
            }

            $result = $this->collection->updateOne(
                ['_id' => new ObjectId($id)],
                ['$set' => $updateData]
            );

            if ($result->getModifiedCount() === 0 && $result->getMatchedCount() === 0) {
                throw new \Exception('No se encontró el profesor');
            }

            $updatedTeacher = $this->collection->findOne(['_id' => new ObjectId($id)]);
            $response = $this->formatTeacherResponse($updatedTeacher);

            Log::info('Perfil actualizado correctamente', ['id' => $id]);
            return response()->json($response);

        } catch (\Exception $e) {
            Log::error('Error actualizando perfil: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al actualizar el perfil',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Iniciando creación de profesor', ['request' => $request->all()]);

            // Verificar que el usuario sea administrador
            $user = $request->get('user');
            if ($user['rol'] !== 'administrador') {
                return response()->json(['message' => 'No autorizado para crear profesores'], 403);
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'email' => [
                    'required',
                    'email',
                    'unique:mongodb.profesores,email',
                    function ($attribute, $value, $fail) {
                        if (!str_ends_with($value, '@iesalandalus.org')) {
                            $fail('El email debe pertenecer al dominio @iesalandalus.org');
                        }
                    },
                ],
                'password' => 'required|string|min:6',
                'departamento' => 'required|string|max:255',
                'provincia' => 'nullable|string|max:255',
                'año_llegada' => 'nullable|integer|min:1900|max:' . date('Y'),
                'fecha_nacimiento' => 'nullable|date',
                'foto' => 'nullable|image|max:2048'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $fotoUrl = null;
            if ($request->hasFile('foto')) {
                try {
                    $fotoUrl = $this->handleImageUpload($request->file('foto'));
                } catch (\Exception $e) {
                    return response()->json([
                        'message' => 'Error al procesar la imagen',
                        'error' => $e->getMessage()
                    ], 500);
                }
            }

            $profesor = [
                'nombre' => $request->nombre,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'departamento' => $request->departamento,
                'provincia' => $request->provincia,
                'año_llegada' => $request->año_llegada ? (int)$request->año_llegada : null,
                'fecha_nacimiento' => $request->fecha_nacimiento ? 
                    new UTCDateTime(strtotime($request->fecha_nacimiento) * 1000) : null,
                'foto' => $fotoUrl,
                'rol' => 'profesor',
                'contador_likes' => 0,
                'created_at' => new UTCDateTime(),
                'updated_at' => new UTCDateTime()
            ];

            $result = $this->collection->insertOne($profesor);

            if (!$result->getInsertedId()) {
                throw new \Exception('Error al insertar el profesor en la base de datos');
            }

            $newProfesor = $this->collection->findOne(['_id' => $result->getInsertedId()]);
            $response = $this->formatTeacherResponse($newProfesor);

            Log::info('Profesor creado exitosamente', ['id' => (string)$newProfesor->_id]);
            return response()->json($response, 201);

        } catch (\Exception $e) {
            Log::error('Error creando profesor: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'message' => 'Error al crear el profesor',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}