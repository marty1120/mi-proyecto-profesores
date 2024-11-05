<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Jenssegers\Mongodb\Eloquent\Model as MongoModel;

class Group extends MongoModel
{
    protected $connection = 'mongodb';
    protected $collection = 'grupos';

    protected $fillable = [
        'name',
        'description',
        'creator_id',
        'tags',
        'department',
        'is_active',
        'max_members'
    ];

    protected $casts = [
        'tags' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relación con los miembros del grupo
    public function members()
    {
        return $this->belongsToMany(Teacher::class, null, 'group_ids', 'member_ids')
            ->withTimestamps()
            ->withPivot('role'); // 'admin' o 'member'
    }

    // Relación con los mensajes del grupo
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    // Métodos de utilidad
    public function addMember(Teacher $teacher, $role = 'member')
    {
        if (!$this->members()->where('_id', $teacher->_id)->exists()) {
            $this->members()->attach($teacher->_id, ['role' => $role]);
            return true;
        }
        return false;
    }

    public function removeMember(Teacher $teacher)
    {
        return $this->members()->detach($teacher->_id);
    }

    public function isAdmin(Teacher $teacher)
    {
        return $this->members()
            ->where('_id', $teacher->_id)
            ->wherePivot('role', 'admin')
            ->exists();
    }

    public function isMember(Teacher $teacher)
    {
        return $this->members()
            ->where('_id', $teacher->_id)
            ->exists();
    }
}