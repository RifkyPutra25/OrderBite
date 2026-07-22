<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class MenuItemController extends Controller
{
    public function index()
    {
        return MenuItem::with('category')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'foto_url' => 'nullable|string',
            'tersedia' => 'boolean',
        ]);

        return MenuItem::create($data);
    }

    public function show(MenuItem $menuItem)
    {
        return $menuItem->load('category');
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'nama' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'harga' => 'required|numeric|min:0',
            'foto_url' => 'nullable|string',
            'tersedia' => 'boolean',
        ]);

        $menuItem->update($data);

        return $menuItem;
    }

    public function destroy(MenuItem $menuItem)
    {
        $menuItem->delete();

        return response()->json(['message' => 'Menu dihapus']);
    }
}