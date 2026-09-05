<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Middleware\EnsureUserIsAdmin;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public status check endpoint
Route::get('/status', function () {
    return response()->json(['status' => 'online']);
});


// Protected routes (Requires Sanctum Session Cookie authentication)
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);


Route::middleware('auth:api')->group(function () {
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::post('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    // Core User & Dashboard endpoints
    Route::get('/user', [ApiController::class, 'user']);
    Route::get('/profile', [ApiController::class, 'profile']);
    Route::get('/dashboard', [ApiController::class, 'dashboard']);
    Route::put('/profile/info', [ProfileController::class, 'updateInfo']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

       // Admin-Only endpoints
    Route::middleware(EnsureUserIsAdmin::class)->group(function () {
        Route::get('/admin/dashboard', [ApiController::class, 'adminDashboard']);
    });
});
