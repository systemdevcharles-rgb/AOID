<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Widen role column to accept 'management'
        // Uses raw SQL for MySQL; on SQLite Laravel rebuilds the table via change()
        try {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','admin_assistant','management') NOT NULL DEFAULT 'admin_assistant'");
        } catch (\Exception) {
            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['admin', 'admin_assistant', 'management'])->default('admin_assistant')->change();
            });
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->text('details')->nullable()->after('control_number');
        });
    }

    public function down(): void
    {
        try {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin','admin_assistant') NOT NULL DEFAULT 'admin_assistant'");
        } catch (\Exception) {
            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['admin', 'admin_assistant'])->default('admin_assistant')->change();
            });
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn('details');
        });
    }
};
