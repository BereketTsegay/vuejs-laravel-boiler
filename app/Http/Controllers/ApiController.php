<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class ApiController extends Controller
{
    /**
     * Get the currently authenticated user.
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * Fetch user profile data.
     */
    public function profile(Request $request)
    {
        return response()->json([
            'profile' => [
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'created_at' => $request->user()->created_at->toIso8601String(),
            ]
        ]);
    }

    /**
     * Fetch regular user dashboard data.
     */
    public function dashboard(Request $request)
    {
        return response()->json([
            'status' => 'success',
            'message' => 'Welcome to your dashboard, ' . $request->user()->name,
            'recent_activity' => []
        ]);
    }

    /**
     * Fetch administrative metrics (Admin Only).
     */
    public function adminDashboard()
    {
        return response()->json([
            'metrics' => [
                'total_users' => User::count(),
                'system_status' => 'Healthy',
                'environment' => app()->environment()
            ]
        ]);
    }
}
