<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RestoTable extends Model
{
    protected $fillable = ['nomor_meja', 'kapasitas', 'status'];

public function orders()
{
    return $this->hasMany(Order::class);
}
}
