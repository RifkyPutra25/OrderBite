<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('metode_bayar')->nullable()->after('status_pembayaran');
            $table->string('midtrans_order_id')->nullable()->unique()->after('metode_bayar');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['metode_bayar', 'midtrans_order_id']);
        });
    }
};