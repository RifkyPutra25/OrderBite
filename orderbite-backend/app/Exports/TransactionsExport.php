<?php

namespace App\Exports;

use App\Models\Order;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $from;
    protected $to;

    public function __construct($from = null, $to = null)
    {
        $this->from = $from;
        $this->to = $to;
    }

    public function collection()
    {
        $query = Order::with(['table', 'items.menuItem'])
            ->where('status_pembayaran', 'lunas')
            ->orderBy('created_at', 'desc');

        if ($this->from && $this->to) {
            $query->whereBetween('created_at', [$this->from, $this->to . ' 23:59:59']);
        }

        return $query->get();
    }

    public function headings(): array
    {
        return ['Tanggal', 'Kode Pesanan', 'Meja', 'Customer', 'Items', 'Total (Rp)'];
    }

    public function map($order): array
    {
        $items = $order->items->map(function ($item) {
            return $item->menuItem->nama . ' x' . $item->qty;
        })->implode(', ');

        return [
            $order->created_at->format('d/m/Y H:i'),
            '#' . $order->id,
            $order->table->nomor_meja ?? '-',
            $order->nama_customer,
            $items,
            $order->total_harga,
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}