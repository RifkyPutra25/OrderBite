<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    protected $fillable = ['category_id', 'nama', 'deskripsi', 'harga', 'foto_url', 'tersedia'];

public function category()
{
    return $this->belongsTo(Category::class);
}
}
