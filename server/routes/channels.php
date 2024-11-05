<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Group;

Broadcast::channel('group.{groupId}', function ($user, $groupId) {
    $group = Group::find($groupId);
    return $group && $group->isMember($user);
});

Broadcast::channel('presence-group.{groupId}', function ($user, $groupId) {
    $group = Group::find($groupId);
    if ($group && $group->isMember($user)) {
        return [
            'id' => $user->id,
            'name' => $user->name
        ];
    }
});