<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\TeacherLikeController;
use App\Http\Controllers\Admin\AdminLikeController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MessageController;

// Rutas públicas
Route::post('/login', [LoginController::class, 'login']);
Route::get('/profesores', [TeacherController::class, 'index']);
Route::get('/profesores/{id}', [TeacherController::class, 'show']);

// Rutas protegidas con autenticación
Route::middleware('auth.token')->group(function () {
    // Autenticación
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/me', [LoginController::class, 'me']);
    
    // Rutas de profesores y likes
    Route::prefix('profesores')->group(function () {
        Route::post('/{id}/actualizar', [TeacherController::class, 'update']);
        
        // Rutas de likes
        Route::post('/{id}/like', [TeacherLikeController::class, 'store']);
        Route::get('/{id}/likes', [TeacherLikeController::class, 'getLikes']);
        Route::get('/{id}/likes-dados', [TeacherLikeController::class, 'getLikesGiven']);
        Route::get('/{id}/historico-likes', [TeacherLikeController::class, 'getTeacherLikeHistory']);
        Route::get('/{id}/estadisticas-likes', [TeacherLikeController::class, 'getLikeStats']);
    });

    // Rutas de administración
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::post('/profesores', [TeacherController::class, 'store']);
        Route::get('/likes', [AdminLikeController::class, 'index']);
        Route::put('/likes/{id}', [AdminLikeController::class, 'update']);
        Route::delete('/likes/{id}', [AdminLikeController::class, 'destroy']);
    });

    // Grupos colaborativos
    Route::prefix('grupos')->group(function () {
        // Operaciones CRUD básicas
        Route::get('/', [GroupController::class, 'index']);
        Route::post('/', [GroupController::class, 'store']);
        Route::get('/{id}', [GroupController::class, 'show']);
        Route::put('/{id}', [GroupController::class, 'update']);
        Route::delete('/{id}', [GroupController::class, 'destroy']);

        // Gestión de membresía
        Route::post('/{id}/unirse', [GroupController::class, 'join']);
        Route::post('/{id}/salir', [GroupController::class, 'leave']);
        Route::put('/{groupId}/members/{memberId}/role', [GroupController::class, 'updateMemberRole']);

        
    });
});