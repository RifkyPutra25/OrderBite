<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = ['category_id', 'nama', 'deskripsi', 'harga', 'foto_url', 'tersedia'];

    protected $appends = ['foto_full_url'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function getFotoFullUrlAttribute()
    {
        return $this->foto_url ? asset('storage/' . $this->foto_url) : null;
    }
}