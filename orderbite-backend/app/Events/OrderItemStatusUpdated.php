<?php

namespace App\Events;

use App\Models\OrderItem;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderItemStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $orderItem;

    public function __construct(OrderItem $orderItem)
    {
        $this->orderItem = $orderItem->load('menuItem');
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('orders'),
            new Channel('order.' . $this->orderItem->order_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'item.status.updated';
    }
}