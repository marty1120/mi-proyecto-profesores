<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\BSON\UTCDateTime;
use MongoDB\BSON\ObjectId;

class Group extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'grupos';
    protected $primaryKey = '_id';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'description',
        'department',
        'creator_id',
        'tags',
        'is_active',
        'members',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'tags' => 'array',
        'members' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->members)) {
                $model->members = [];
            }
            if (empty($model->tags)) {
                $model->tags = [];
            }
            if (!isset($model->is_active)) {
                $model->is_active = true;
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

    public function isMember($userId)
{
    if (!is_array($this->members)) {
        return false;
    }

    $userId = (string)$userId;
    return collect($this->members)->contains(function ($member) use ($userId) {
        return (string)($member['id'] ?? '') === $userId;
    });
}

public function getMemberRole($userId)
{
    if (!is_array($this->members)) {
        return null;
    }

    $userId = (string)$userId;
    $member = collect($this->members)
        ->first(function ($member) use ($userId) {
            return (string)($member['id'] ?? '') === $userId;
        });

    return $member['role'] ?? null;
}

public function isAdmin($user)
{
    // Si el usuario es administrador global
    if (isset($user['rol']) && $user['rol'] === 'administrador') {
        return true;
    }

    if (!is_array($this->members)) {
        return false;
    }

    $userId = (string)$user['id'];
    return collect($this->members)
        ->contains(function ($member) use ($userId) {
            return (string)($member['id'] ?? '') === $userId && 
                   ($member['role'] ?? '') === 'admin';
        });
}

    public function addMember($user, $role = 'member')
    {
        if ($this->isMember($user['id'])) {
            return false;
        }

        $this->members[] = [
            'id' => (string)$user['id'],
            'name' => $user['nombre'],
            'department' => $user['departamento'],
            'role' => $role
        ];

        return $this->save();
    }

    public function removeMember($userId)
    {
        if (!is_array($this->members)) {
            return false;
        }

        $userId = (string)$userId;

        $this->members = collect($this->members)
            ->reject(function ($member) use ($userId) {
                return (string)($member['id'] ?? '') === $userId;
            })
            ->values()
            ->all();

        return $this->save();
    }
}
