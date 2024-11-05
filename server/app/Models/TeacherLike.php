<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use MongoDB\Laravel\Eloquent\Model as MongoModel;

class TeacherLike extends MongoModel
{
    protected $connection = 'mongodb';
    protected $collection = 'likes';

    protected $fillable = [
        'teacher_id',      // ID del profesor que recibe el like
        'given_by_id',     // ID del profesor que da el like
        'like_type',       // Tipo de like (compañerismo, innovación, etc.)
        'comment',         // Comentario explicando el motivo
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relación con el profesor que recibe el like
    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    // Relación con el profesor que da el like
    public function givenBy()
    {
        return $this->belongsTo(Teacher::class, 'given_by_id');
    }
}