<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return User::whereIn('role', ['kasir', 'dapur'])->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:kasir,dapur',
        ]);

        return User::create($data);
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json(['message' => 'Akun dihapus']);
    }
}