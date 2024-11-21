<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Auth\Authenticatable as AuthenticatableTrait;
use Illuminate\Contracts\Auth\Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use MongoDB\BSON\UTCDateTime;

class Teacher extends Model implements Authenticatable
{
    use AuthenticatableTrait, HasApiTokens;

    protected $connection = 'mongodb';
    protected $collection = 'profesores';
    protected $primaryKey = '_id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'nombre',
        'email',
        'password',
        'departamento',
        'foto',
        'fecha_nacimiento',
        'año_llegada',
        'provincia',
        'rol',
        'contador_likes'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'datetime',
        'contador_likes' => 'integer'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->contador_likes)) {
                $model->contador_likes = 0;
            }
            if (empty($model->created_at)) {
                $model->created_at = new UTCDateTime(round(microtime(true) * 1000));
            }
            if (empty($model->updated_at)) {
                $model->updated_at = new UTCDateTime(round(microtime(true) * 1000));
            }
        });

        static::updating(function ($model) {
            $model->updated_at = new UTCDateTime(round(microtime(true) * 1000));
        });
    }

    public function toArray()
    {
        $array = parent::toArray();
        $array['id'] = (string) $this->_id;
        return $array;
    }

    public function esAdministrador()
    {
        return $this->rol === 'administrador';
    }

    public function esProfesor()
    {
        return $this->rol === 'profesor';
    }
}