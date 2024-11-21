<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->get('user');
        
        if (!$user || $user['rol'] !== 'administrador') {
            return response()->json([
                'message' => 'No tienes permisos de administrador para realizar esta acción'
            ], 403);
        }

        return $next($request);
    }
}