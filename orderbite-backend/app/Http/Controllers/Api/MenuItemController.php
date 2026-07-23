<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            'foto' => 'nullable|image|max:2048',
            'tersedia' => 'boolean',
        ]);

        if ($request->hasFile('foto')) {
            $path = $request->file('foto')->store('menu-photos', 'public');
            $data['foto_url'] = $path;
        }

        unset($data['foto']);

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
            'foto' => 'nullable|image|max:2048',
            'tersedia' => 'boolean',
        ]);

        if ($request->hasFile('foto')) {
            if ($menuItem->foto_url) {
                Storage::disk('public')->delete($menuItem->foto_url);
            }
            $path = $request->file('foto')->store('menu-photos', 'public');
            $data['foto_url'] = $path;
        }

        unset($data['foto']);

        $menuItem->update($data);

        return $menuItem;
    }

    public function destroy(MenuItem $menuItem)
    {
        if ($menuItem->foto_url) {
            Storage::disk('public')->delete($menuItem->foto_url);
        }

        $menuItem->delete();

        return response()->json(['message' => 'Menu dihapus']);
    }
}