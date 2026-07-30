<?php

namespace App\Http\Controllers\Api;

use App\Events\OrderPaymentUpdated;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Midtrans\Config;
use Midtrans\Notification;
use Midtrans\Snap;

class PaymentController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    // Dipanggil Customer untuk generate token pembayaran Midtrans
    public function createSnapToken(Order $order)
    {
        if ($order->status_pembayaran === 'lunas') {
            return response()->json(['message' => 'Pesanan ini sudah lunas'], 400);
        }

        $midtransOrderId = 'ORDERBITE-' . $order->id . '-' . time();

        $params = [
            'transaction_details' => [
                'order_id' => $midtransOrderId,
                'gross_amount' => (int) $order->total_harga,
            ],
            'customer_details' => [
                'first_name' => $order->nama_customer,
            ],
            'item_details' => $order->items->map(function ($item) {
                return [
                    'id' => $item->menu_item_id,
                    'price' => (int) $item->menuItem->harga,
                    'quantity' => $item->qty,
                    'name' => substr($item->menuItem->nama, 0, 50),
                ];
            })->toArray(),
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            $order->update(['midtrans_order_id' => $midtransOrderId]);

            return response()->json([
                'snap_token' => $snapToken,
                'client_key' => config('services.midtrans.client_key'),
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal membuat transaksi: ' . $e->getMessage()], 500);
        }
    }

    // Webhook dipanggil otomatis oleh server Midtrans saat status pembayaran berubah
    public function handleNotification(Request $request)
    {
        try {
            $notification = new Notification();

            $transactionStatus = $notification->transaction_status;
            $midtransOrderId = $notification->order_id;
            $paymentType = $notification->payment_type;

            $order = Order::where('midtrans_order_id', $midtransOrderId)->first();

            if (!$order) {
                return response()->json(['message' => 'Order tidak ditemukan'], 404);
            }

            if (in_array($transactionStatus, ['capture', 'settlement'])) {
                $order->update([
                    'status_pembayaran' => 'lunas',
                    'metode_bayar' => $paymentType,
                ]);
                broadcast(new OrderPaymentUpdated($order));
            } elseif (in_array($transactionStatus, ['deny', 'cancel', 'expire'])) {
                $order->update(['status_pembayaran' => 'belum_bayar']);
            }

            return response()->json(['message' => 'OK']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }
}