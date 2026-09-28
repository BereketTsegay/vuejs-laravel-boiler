<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Admin User',
        //     'email' => 'admin@bntech.com',
        //     'password' => bcrypt('12345678'), // Change this to

        // ]);

        // 1. First establish your systemic roles and permission matrix rows
        $this->call(RolesAndPermissionsSeeder::class);

        // 2. Provision your initial developer/administrative user accounts
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@bntech.com'],
            [
                'name' => 'Root Administrator',
                'password' => Hash::make('123456789'), // Always use Hash
            ]
        );

        // 3. Spatie Magic: Map the user row directly to the polymorphic tables
        // This inserts a row directly into the model_has_roles table automatically
        $adminUser->assignRole('admin'); 
        
        
        // Optional: Create a secondary limited testing account
        $editorUser = User::firstOrCreate(
            ['email' => 'editor@bntech.com'],
            [
                'name' => 'Content Manager',
                'password' => Hash::make('123456789!'),
            ]
        );
        
        $editorUser->assignRole('editor');
    }
}
