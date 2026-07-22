<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\RestoTable;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    // Untuk Kasir & Dapur: lihat semua order aktif
    public function index()
    {
        return Order::with(['table', 'items.menuItem'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function show(Order $order)
    {
        return $order->load(['table', 'items.menuItem']);
    }

    // Buat order baru (dipakai Kasir untuk pesanan manual, dan Customer nanti)
    public function store(Request $request)
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
        $menuItems = \App\Models\MenuItem::whereIn('id', collect($data['items'])->pluck('menu_item_id'))->get()->keyBy('id');

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

        // Tandai meja jadi terisi
        RestoTable::where('id', $data['resto_table_id'])->update(['status' => 'terisi']);

        return $order->load(['table', 'items.menuItem']);
    }

    // Kasir: update status pembayaran jadi lunas
    public function updatePayment(Order $order)
    {
        $order->update(['status_pembayaran' => 'lunas']);

        return $order;
    }

    // Kasir: selesaikan order (kosongkan meja lagi)
    public function complete(Order $order)
    {
        $order->table()->update(['status' => 'kosong']);

        return response()->json(['message' => 'Order selesai, meja dikosongkan']);
    }

    // Dapur: update status item pesanan
    public function updateItemStatus(Request $request, OrderItem $orderItem)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,dimasak,siap',
        ]);

        $orderItem->update($data);

        return $orderItem->load('menuItem');
    }
}