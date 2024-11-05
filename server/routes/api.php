<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\TeacherLikeController;

// Rutas públicas
Route::post('/login', [LoginController::class, 'login']);
Route::get('/profesores', [TeacherController::class, 'index']);
Route::get('/profesores/{id}', [TeacherController::class, 'show']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::get('/me', [LoginController::class, 'me']);

    // Profesores - Likes y habilidades
    Route::post('/profesores/{id}/like', [TeacherLikeController::class, 'store']);
    Route::get('/profesores/{id}/likes', [TeacherLikeController::class, 'getLikes']);
    Route::get('/profesores/{id}/historico-likes', [TeacherLikeController::class, 'getTeacherLikeHistory']);
    Route::get('/profesores/{id}/estadisticas-likes', [TeacherLikeController::class, 'getLikeStats']);

    // Grupos
    Route::prefix('grupos')->group(function () {
        Route::get('/', [GroupController::class, 'index']);
        Route::post('/', [GroupController::class, 'store']);
        Route::get('/{grupo}', [GroupController::class, 'show']);
        Route::put('/{grupo}', [GroupController::class, 'update']);
        Route::delete('/{grupo}', [GroupController::class, 'destroy']);
        Route::post('/{grupo}/unirse', [GroupController::class, 'join']);
        Route::post('/{grupo}/salir', [GroupController::class, 'leave']);

        // Mensajes dentro de grupos
        Route::get('/{grupo}/mensajes', [MessageController::class, 'index']);
        Route::post('/{grupo}/mensajes', [MessageController::class, 'store']);
        Route::put('/{grupo}/mensajes/{mensaje}', [MessageController::class, 'update']);
        Route::delete('/{grupo}/mensajes/{mensaje}', [MessageController::class, 'destroy']);
    });
});