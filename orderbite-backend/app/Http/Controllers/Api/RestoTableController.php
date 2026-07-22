<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RestoTable;
use Illuminate\Http\Request;

class RestoTableController extends Controller
{
    public function index()
    {
        return RestoTable::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nomor_meja' => 'required|string|max:50|unique:resto_tables',
            'kapasitas' => 'required|integer|min:1',
        ]);

        return RestoTable::create($data);
    }

    public function show(RestoTable $restoTable)
    {
        return $restoTable;
    }

    public function update(Request $request, RestoTable $restoTable)
    {
        $data = $request->validate([
            'nomor_meja' => 'required|string|max:50|unique:resto_tables,nomor_meja,' . $restoTable->id,
            'kapasitas' => 'required|integer|min:1',
            'status' => 'in:kosong,terisi',
        ]);

        $restoTable->update($data);

        return $restoTable;
    }

    public function destroy(RestoTable $restoTable)
    {
        $restoTable->delete();

        return response()->json(['message' => 'Meja dihapus']);
    }
}