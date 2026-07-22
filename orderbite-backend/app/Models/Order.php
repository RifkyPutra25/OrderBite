<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = ['resto_table_id', 'nama_customer', 'status_pembayaran', 'total_harga'];

public function table()
{
    return $this->belongsTo(RestoTable::class, 'resto_table_id');
}

public function items()
{
    return $this->hasMany(OrderItem::class);
}
}
