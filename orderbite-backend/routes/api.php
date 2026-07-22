<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\RestoTableController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('menu-items', MenuItemController::class);
        Route::apiResource('tables', RestoTableController::class);
        Route::apiResource('users', UserController::class)->only(['index', 'store', 'destroy']);
    });

    Route::middleware('role:admin,kasir')->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
        Route::get('/tables-status', [RestoTableController::class, 'index']);
    });

    Route::middleware('role:kasir')->group(function () {
        Route::post('/orders', [OrderController::class, 'store']);
        Route::patch('/orders/{order}/payment', [OrderController::class, 'updatePayment']);
        Route::patch('/orders/{order}/complete', [OrderController::class, 'complete']);
    });

    Route::middleware('role:dapur')->group(function () {
        Route::get('/kitchen-orders', [OrderController::class, 'index']);
        Route::patch('/order-items/{orderItem}/status', [OrderController::class, 'updateItemStatus']);
    });
});