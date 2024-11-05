<?php

namespace App\Models;

use Jenssegers\Mongodb\Eloquent\Model as MongoModel;

class Message extends MongoModel
{
    protected $connection = 'mongodb';
    protected $collection = 'mensajes';

    protected $fillable = [
        'group_id',
        'sender_id',
        'content',
        'type', // 'text', 'file', 'image'
        'file_url',
        'file_name',
        'file_size',
        'is_edited',
        'parent_id' // Para respuestas a mensajes
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'is_edited' => 'boolean'
    ];

    // Relación con el grupo
    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    // Relación con el profesor que envió el mensaje
    public function sender()
    {
        return $this->belongsTo(Teacher::class, 'sender_id');
    }

    // Mensaje padre (en caso de ser una respuesta)
    public function parent()
    {
        return $this->belongsTo(Message::class, 'parent_id');
    }

    // Respuestas a este mensaje
    public function replies()
    {
        return $this->hasMany(Message::class, 'parent_id');
    }
}