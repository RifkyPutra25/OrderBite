<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use App\Exports\TransactionsExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    // Ringkasan: total pendapatan hari ini, bulan ini, jumlah order
    public function summary()
    {
        $today = now()->format('Y-m-d');
        $startOfMonth = now()->startOfMonth()->format('Y-m-d');

        $todayRevenue = Order::where('status_pembayaran', 'lunas')
            ->whereDate('created_at', $today)
            ->sum('total_harga');

        $monthRevenue = Order::where('status_pembayaran', 'lunas')
            ->whereDate('created_at', '>=', $startOfMonth)
            ->sum('total_harga');

        $todayOrders = Order::whereDate('created_at', $today)->count();
        $monthOrders = Order::whereDate('created_at', '>=', $startOfMonth)->count();

        return response()->json([
            'today_revenue' => $todayRevenue,
            'month_revenue' => $monthRevenue,
            'today_orders' => $todayOrders,
            'month_orders' => $monthOrders,
        ]);
    }

    // Grafik pendapatan 7 hari terakhir
    public function weeklyRevenue()
    {
        $data = Order::where('status_pembayaran', 'lunas')
            ->where('created_at', '>=', now()->subDays(6)->startOfDay())
            ->select(DB::raw('DATE(created_at) as tanggal'), DB::raw('SUM(total_harga) as total'))
            ->groupBy('tanggal')
            ->orderBy('tanggal')
            ->get();

        return $data;
    }

    // Menu terlaris
    public function bestSellers()
    {
        $data = OrderItem::join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->select('menu_items.nama', DB::raw('SUM(order_items.qty) as total_terjual'))
            ->groupBy('menu_items.id', 'menu_items.nama')
            ->orderByDesc('total_terjual')
            ->limit(5)
            ->get();

        return $data;
    }

    // Riwayat semua transaksi (untuk tabel rekap)
    public function transactions(Request $request)
    {
        $query = Order::with(['table', 'items.menuItem'])
            ->where('status_pembayaran', 'lunas')
            ->orderBy('created_at', 'desc');

        if ($request->has('from') && $request->has('to')) {
            $query->whereBetween('created_at', [$request->from, $request->to . ' 23:59:59']);
        }

        return $query->paginate(20);
    }
    public function dashboard()
{
    $activeOrders = \App\Models\Order::where('status_pembayaran', 'belum_bayar')->count();
    $tablesOccupied = \App\Models\RestoTable::where('status', 'terisi')->count();
    $tablesTotal = \App\Models\RestoTable::count();
    $menuUnavailable = \App\Models\MenuItem::where('tersedia', false)->count();
    $pendingKitchenItems = \App\Models\OrderItem::whereIn('status', ['pending', 'dimasak'])->count();

    $recentOrders = \App\Models\Order::with('table')
        ->orderBy('created_at', 'desc')
        ->limit(5)
        ->get();

    return response()->json([
        'active_orders' => $activeOrders,
        'tables_occupied' => $tablesOccupied,
        'tables_total' => $tablesTotal,
        'menu_unavailable' => $menuUnavailable,
        'pending_kitchen_items' => $pendingKitchenItems,
        'recent_orders' => $recentOrders,
    ]);
}
public function overview()
{
    $today = now()->format('Y-m-d');
    $startOfMonth = now()->startOfMonth()->format('Y-m-d');

    $todayRevenue = \App\Models\Order::where('status_pembayaran', 'lunas')
        ->whereDate('created_at', $today)->sum('total_harga');
    $monthRevenue = \App\Models\Order::where('status_pembayaran', 'lunas')
        ->whereDate('created_at', '>=', $startOfMonth)->sum('total_harga');
    $todayOrders = \App\Models\Order::whereDate('created_at', $today)->count();
    $monthOrders = \App\Models\Order::whereDate('created_at', '>=', $startOfMonth)->count();

    $activeOrders = \App\Models\Order::where('status_pembayaran', 'belum_bayar')->count();
    $tablesOccupied = \App\Models\RestoTable::where('status', 'terisi')->count();
    $tablesTotal = \App\Models\RestoTable::count();
    $menuUnavailable = \App\Models\MenuItem::where('tersedia', false)->count();
    $pendingKitchenItems = \App\Models\OrderItem::whereIn('status', ['pending', 'dimasak'])->count();
    $recentOrders = \App\Models\Order::with('table')->orderBy('created_at', 'desc')->limit(5)->get();

    $weeklyRevenue = \App\Models\Order::where('status_pembayaran', 'lunas')
        ->where('created_at', '>=', now()->subDays(6)->startOfDay())
        ->select(\Illuminate\Support\Facades\DB::raw('DATE(created_at) as tanggal'), \Illuminate\Support\Facades\DB::raw('SUM(total_harga) as total'))
        ->groupBy('tanggal')->orderBy('tanggal')->get();

    return response()->json([
        'summary' => [
            'today_revenue' => $todayRevenue,
            'month_revenue' => $monthRevenue,
            'today_orders' => $todayOrders,
            'month_orders' => $monthOrders,
        ],
        'dashboard' => [
            'active_orders' => $activeOrders,
            'tables_occupied' => $tablesOccupied,
            'tables_total' => $tablesTotal,
            'menu_unavailable' => $menuUnavailable,
            'pending_kitchen_items' => $pendingKitchenItems,
            'recent_orders' => $recentOrders,
        ],
        'weekly_revenue' => $weeklyRevenue,
    ]);
}

public function fullReport(Request $request)
{
    $today = now()->format('Y-m-d');
    $startOfMonth = now()->startOfMonth()->format('Y-m-d');

    $todayRevenue = \App\Models\Order::where('status_pembayaran', 'lunas')
        ->whereDate('created_at', $today)->sum('total_harga');
    $monthRevenue = \App\Models\Order::where('status_pembayaran', 'lunas')
        ->whereDate('created_at', '>=', $startOfMonth)->sum('total_harga');
    $todayOrders = \App\Models\Order::whereDate('created_at', $today)->count();
    $monthOrders = \App\Models\Order::whereDate('created_at', '>=', $startOfMonth)->count();

    $weeklyRevenue = \App\Models\Order::where('status_pembayaran', 'lunas')
        ->where('created_at', '>=', now()->subDays(6)->startOfDay())
        ->select(\Illuminate\Support\Facades\DB::raw('DATE(created_at) as tanggal'), \Illuminate\Support\Facades\DB::raw('SUM(total_harga) as total'))
        ->groupBy('tanggal')->orderBy('tanggal')->get();

    $bestSellers = \App\Models\OrderItem::join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
        ->select('menu_items.nama', \Illuminate\Support\Facades\DB::raw('SUM(order_items.qty) as total_terjual'))
        ->groupBy('menu_items.id', 'menu_items.nama')
        ->orderByDesc('total_terjual')->limit(5)->get();

    $transactions = \App\Models\Order::with(['table', 'items.menuItem'])
        ->where('status_pembayaran', 'lunas')
        ->orderBy('created_at', 'desc')
        ->paginate(20);

    return response()->json([
        'summary' => [
            'today_revenue' => $todayRevenue,
            'month_revenue' => $monthRevenue,
            'today_orders' => $todayOrders,
            'month_orders' => $monthOrders,
        ],
        'weekly_revenue' => $weeklyRevenue,
        'best_sellers' => $bestSellers,
        'transactions' => $transactions,
    ]);
}
    public function exportTransactions(Request $request)
    {
        $from = $request->query('from');
        $to = $request->query('to');

        $filename = 'laporan-orderbite-' . now()->format('Y-m-d') . '.xlsx';

        return Excel::download(new TransactionsExport($from, $to), $filename);
    }
}