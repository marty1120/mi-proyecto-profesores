<?php

namespace App\Models;

use MongoDB\Laravel\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Teacher extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $connection = 'mongodb';
    protected $collection = 'profesores';

    protected $fillable = [
        '_id',
        'nombre',
        'email',
        'password',
        'departamento',
        'foto',
        'fecha_nacimiento',
        'año_llegada',
        'provincia',
        'rol',
        'contador_likes',
        'habilidades'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'fecha_nacimiento' => 'date',
        'habilidades' => 'array',
        'contador_likes' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Método helper para verificar si es administrador
    public function esAdministrador(): bool
    {
        return $this->rol === 'administrador';
    }

    // Método helper para verificar si es profesor
    public function esProfesor(): bool
    {
        return $this->rol === 'profesor';
    }
}