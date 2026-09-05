<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create structural Roles Lookup Matrix
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // e.g., 'admin', 'manager', 'customer'
            $table->string('name');           // e.g., 'Administrator', 'Manager'
            $table->timestamps();
        });

        // 2. Refactor existing users table to use relationship binding
        Schema::table('users', function (Blueprint $table) {
            // Drop old string format column safely if it exists from previous steps
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }

            // Establish constrained relational tracking link
            $table->foreignId('role_id')->nullable()->after('email')->constrained('roles')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
        Schema::dropIfExists('roles');
    }
};
