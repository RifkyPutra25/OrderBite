<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Contoh proteksi per role (dipakai nanti di tahap Admin/Kasir/Dapur)
    Route::middleware('role:admin')->group(function () {
        // route khusus admin nanti di sini
    });

    Route::middleware('role:kasir')->group(function () {
        // route khusus kasir nanti di sini
    });

    Route::middleware('role:dapur')->group(function () {
        // route khusus dapur nanti di sini
    });
});