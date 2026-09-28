<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionController extends Controller
{
    // 1. Get all roles, permissions, and matrix overview
    public function index()
    {
        return response()->json([
            'roles' => Role::with('permissions:name')->get(),
            'permissions' => Permission::all()->pluck('name'),
        ]);
    }

    // 2. Sync permissions inside a specific role
    public function updateRolePermissions(Request $request, Role $role)
    {
        $request->validate([
            'permissions' => 'required|array',
        ]);

        // Syncs exactly what is provided, revoking anything missing
        $role->syncPermissions($request->permissions);

        return response()->json([
            'status' => 'success',
            'message' => "Permissions updated for role: {$role->name}",
            'role' => $role->load('permissions:name')
        ]);
    }

    // 3. Assign or revoke roles for a specific User
    public function updateUserRoles(Request $request, User $user)
    {
        $request->validate([
            'roles' => 'required|array',
        ]);

        $user->syncRoles($request->roles);

        return response()->json([
            'status' => 'success',
            'message' => "Roles updated for user: {$user->name}",
        ]);
    }
    /**
 * 4. Create a completely new role or permission
 */
public function storeSchema(Request $request)
{
    // Clean user inputs proactively before parsing validation logic arrays
    if ($request->has('name')) {
        $request->merge([
            'name' => trim(strtolower($request->get('name')))
        ]);
    }

    // Enforce matching systemic rules
    $request->validate([
        'type' => 'required|in:role,permission',
        'name' => [
            'required',
            'string',
            'min:3',
            'max:50',
            // Regex constraints forcing string kebab-casing format
            'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            // Unique index validations ignoring cross-model types
            $request->type === 'role' 
                ? 'unique:roles,name' 
                : 'unique:permissions,name'
        ],
    ], [
        'name.regex' => 'The name syntax framework must follow a strict lowercase kebab-case layout (e.g., delete-users, site-manager).'
    ]);

    if ($request->type === 'role') {
        $entity = Role::create(['name' => $request->name, 'guard_name' => 'api']);
    } else {
        $entity = Permission::create(['name' => $request->name, 'guard_name' => 'api']);
    }

    return response()->json([
        'status' => 'success',
        'message' => ucfirst($request->type) . ' created successfully.',
        'entity' => $entity
    ], 201);
}

/**
 * 5. Search users and return their active roles
 */
public function searchUsers(Request $request)
{
    $search = $request->get('q');
    
    $users = User::where('name', 'LIKE', "%{$search}%")
        ->orWhere('email', 'LIKE', "%{$search}%")
        ->with('roles:name')
        ->limit(10)
        ->get()
        ->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name') // Flat array of assigned roles
            ];
        });

    return response()->json($users);
}
}
