<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin OrderBite',
            'email' => 'admin@orderbite.com',
            'password' => 'password',
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Kasir OrderBite',
            'email' => 'kasir@orderbite.com',
            'password' => 'password',
            'role' => 'kasir',
        ]);

        User::create([
            'name' => 'Dapur OrderBite',
            'email' => 'dapur@orderbite.com',
            'password' => 'password',
            'role' => 'dapur',
        ]);
    }
}