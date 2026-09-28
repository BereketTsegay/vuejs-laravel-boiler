<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Reset cached roles and permissions to prevent synchronization lockups
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Define the core permission architecture
        $permissions = [
            // User Administration
            'users-create', 'users-view', 'users-edit', 'users-delete',
            // Content/Operations Administration
            'content-publish', 'content-edit', 'content-archive',
            // System Config (Super Admins only)
            'system-settings-modify', 'audit-logs-view'
        ];

        // 3. Persist missing permissions to the database safely
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'api']);
        }

        // 4. Create roles and sync defined permissions maps
        
        // Editor Tier
        $editorRole = Role::firstOrCreate(['name' => 'editor', 'guard_name' => 'api']);
        $editorRole->syncPermissions([
            'users-view',
            'content-publish',
            'content-edit'
        ]);

        // Administrator Tier (Gets absolutely all defined capabilities)
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
        $adminRole->syncPermissions(Permission::all());
    }
}
