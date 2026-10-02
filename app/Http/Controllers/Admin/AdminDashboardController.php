<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\Hash;

class AdminDashboardController extends Controller
{
    // --- USER MANAGEMENT ---
    public function usersIndex()
    {
        return response()->json(User::with('roles:name')->latest()->paginate(10));
    }

    public function userStore(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        activity()->performedOn($user)->log('Created a new system user account');

        return response()->json(['status' => 'success', 'user' => $user], 201);
    }

    // --- SYSTEM ACTIVITY LOGS ---
    public function activityIndex()
    {
        // Pull latest 50 system activities with the user who performed them
        $logs = Activity::with('causer')
            ->latest()
            ->limit(50)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'description' => $log->description,
                    'causer' => $log->causer ? $log->causer->name : 'System/Guest',
                    'created_at' => $log->created_at->toIso8601String(),
                ];
            });

        return response()->json($logs);
    }
}
