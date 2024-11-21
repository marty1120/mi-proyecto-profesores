<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as MongoModel;

class TeacherLike extends MongoModel
{
    protected $connection = 'mongodb';
    protected $collection = 'likes';

    // Definimos las categorías principales y sus subcategorías
    public const CATEGORIES = [
        'PEDAGOGIA' => [
            'nombre' => 'Pedagogía',
            'descripcion' => 'Habilidades clave para enseñar de manera efectiva',
            'subcategorias' => [
                'COMUNICACION' => 'Comunicación clara y efectiva',
                'MOTIVACION' => 'Capacidad de motivar a los alumnos',
                'PACIENCIA' => 'Paciencia en la enseñanza',
                'INNOVACION_DOCENTE' => 'Métodos innovadores de enseñanza'
            ]
        ],
        'SOFT_SKILLS' => [
            'nombre' => 'Soft Skills',
            'descripcion' => 'Habilidades interpersonales esenciales',
            'subcategorias' => [
                'EMPATIA' => 'Empatía con compañeros y alumnos',
                'TRABAJO_EQUIPO' => 'Trabajo en equipo',
                'COMPANERISMO' => 'Apoyo y ayuda a compañeros',
                'ADAPTABILIDAD' => 'Adaptabilidad a cambios'
            ]
        ],
        'PROFESIONAL' => [
            'nombre' => 'Profesional',
            'descripcion' => 'Competencias relacionadas con la organización, innovación y liderazgo',
            'subcategorias' => [
                'ORGANIZACION' => 'Capacidad de organización',
                'LIDERAZGO' => 'Habilidades de liderazgo',
                'INICIATIVA' => 'Toma de iniciativa en proyectos',
                'COMPROMISO' => 'Compromiso con el centro y la educación'
            ]
        ]
    ];

    protected $fillable = [
        'teacher_id',
        'given_by_id',
        'category',          // Categoría principal (PEDAGOGIA, SOFT_SKILLS, PROFESIONAL)
        'subcategory',       // Subcategoría específica
        'comment',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Validación de categoría y subcategoría
    public static function isValidCategoryAndSubcategory($category, $subcategory)
    {
        if (!array_key_exists($category, self::CATEGORIES)) {
            return false;
        }
        return array_key_exists($subcategory, self::CATEGORIES[$category]['subcategorias']);
    }

    // Obtener información de una categoría
    public static function getCategoryInfo($category)
    {
        return self::CATEGORIES[$category] ?? null;
    }

    // Obtener nombre de subcategoría
    public static function getSubcategoryName($category, $subcategory)
    {
        return self::CATEGORIES[$category]['subcategorias'][$subcategory] ?? null;
    }

    // Relaciones
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function givenBy()
    {
        return $this->belongsTo(Teacher::class, 'given_by_id');
    }

    // Método para obtener estadísticas detalladas
    public static function getDetailedStats($teacherId)
    {
        $likes = self::where('teacher_id', $teacherId)->get();
        $stats = [];

        foreach (self::CATEGORIES as $catKey => $category) {
            $stats[$catKey] = [
                'nombre' => $category['nombre'],
                'descripcion' => $category['descripcion'],
                'total' => 0,
                'subcategorias' => []
            ];

            foreach ($category['subcategorias'] as $subKey => $subName) {
                $count = $likes->where('category', $catKey)
                              ->where('subcategory', $subKey)
                              ->count();
                
                if ($count > 0) {
                    $stats[$catKey]['subcategorias'][$subKey] = [
                        'nombre' => $subName,
                        'count' => $count
                    ];
                    $stats[$catKey]['total'] += $count;
                }
            }
        }

        return $stats;
    }

    // Método para obtener el progreso en cada categoría (para las barras de progreso)
    public static function calculateCategoryProgress($teacherId)
    {
        $stats = self::getDetailedStats($teacherId);
        $progress = [];

        foreach (self::CATEGORIES as $catKey => $category) {
            $totalLikes = $stats[$catKey]['total'];
            // Calcular progreso basado en cantidad de likes
            // Base: 30 puntos
            // Por cada like: 5 puntos hasta un máximo de 70 puntos adicionales
            $baseProgress = 30;
            $additionalProgress = min(70, $totalLikes * 5);
            $progress[$catKey] = $baseProgress + $additionalProgress;
        }

        return $progress;
    }
}