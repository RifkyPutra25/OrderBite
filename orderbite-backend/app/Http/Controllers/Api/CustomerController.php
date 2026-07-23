<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\RestoTable;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    // Cek meja valid (dipanggil saat customer scan QR)
    public function getTable($id)
    {
        $table = RestoTable::find($id);

        if (!$table) {
            return response()->json(['message' => 'Meja tidak ditemukan'], 404);
        }

        return $table;
    }

    // Ambil semua kategori + menu (untuk ditampilkan ke customer)
    public function getMenu()
    {
        $categories = Category::with(['menuItems' => function ($query) {
            $query->where('tersedia', true);
        }])->get();

        return $categories;
    }

    // Customer checkout (buat order baru, tanpa login)
    public function createOrder(Request $request)
    {
        $data = $request->validate([
            'resto_table_id' => 'required|exists:resto_tables,id',
            'nama_customer' => 'required|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.catatan' => 'nullable|string',
        ]);

        $total = 0;
        $menuItems = MenuItem::whereIn('id', collect($data['items'])->pluck('menu_item_id'))->get()->keyBy('id');

        foreach ($data['items'] as $item) {
            $total += $menuItems[$item['menu_item_id']]->harga * $item['qty'];
        }

        $order = Order::create([
            'resto_table_id' => $data['resto_table_id'],
            'nama_customer' => $data['nama_customer'],
            'status_pembayaran' => 'belum_bayar',
            'total_harga' => $total,
        ]);

        foreach ($data['items'] as $item) {
            OrderItem::create([
                'order_id' => $order->id,
                'menu_item_id' => $item['menu_item_id'],
                'qty' => $item['qty'],
                'catatan' => $item['catatan'] ?? null,
                'status' => 'pending',
            ]);
        }

        RestoTable::where('id', $data['resto_table_id'])->update(['status' => 'terisi']);

        return $order->load(['table', 'items.menuItem']);
    }

    // Customer cek status pesanan mereka sendiri
    public function trackOrder($id)
    {
        $order = Order::with(['table', 'items.menuItem'])->find($id);

        if (!$order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan'], 404);
        }

        return $order;
    }
}