<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\RestoTableController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ReportController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
// Route publik untuk Customer (tanpa login)
Route::prefix('public')->group(function () {
    Route::get('/tables/{id}', [CustomerController::class, 'getTable']);
    Route::get('/menu', [CustomerController::class, 'getMenu']);
    Route::post('/orders', [CustomerController::class, 'createOrder']);
    Route::get('/orders/{id}', [CustomerController::class, 'trackOrder']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // GET yang boleh diakses admin + kasir (dan dapur untuk menu-items)
    Route::middleware('role:admin,kasir,dapur')->group(function () {
        Route::get('/tables', [RestoTableController::class, 'index']);
        Route::get('/tables/{table}', [RestoTableController::class, 'show']);
        Route::get('/menu-items', [MenuItemController::class, 'index']);
        Route::get('/menu-items/{menu_item}', [MenuItemController::class, 'show']);
    });

    // Admin-only: kelola data (create/update/delete) + kategori + user
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('categories', CategoryController::class);
        Route::apiResource('menu-items', MenuItemController::class)->except(['index', 'show']);
        Route::apiResource('tables', RestoTableController::class)->except(['index', 'show']);
        Route::apiResource('users', UserController::class)->only(['index', 'store', 'destroy']);
        Route::get('/reports/summary', [ReportController::class, 'summary']);
        Route::get('/reports/weekly-revenue', [ReportController::class, 'weeklyRevenue']);
        Route::get('/reports/best-sellers', [ReportController::class, 'bestSellers']);
        Route::get('/reports/transactions', [ReportController::class, 'transactions']);
    });

    Route::middleware('role:admin,kasir')->group(function () {
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{order}', [OrderController::class, 'show']);
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