<?php

use App\Http\Controllers\DocumentCategoryController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

// Accessible to any authenticated user regardless of approval status
Route::middleware('auth')->group(function () {
    Route::get('/pending', function () {
        if (request()->user()->status === 'approved') {
            return redirect()->route('dashboard');
        }
        return Inertia::render('Pending');
    })->name('pending');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Requires an approved account
Route::middleware(['auth', 'approved'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard', [
            'stats' => [
                'categories' => \App\Models\DocumentCategory::count(),
                'documents'  => \App\Models\Document::count(),
            ],
        ]);
    })->name('dashboard');

    // AID — Attachment Issuance Documents
    Route::get('/aid', [DocumentController::class, 'index'])->name('aid.index');
    Route::post('/aid/documents', [DocumentController::class, 'store'])->name('aid.documents.store');
    Route::delete('/aid/documents/{document}', [DocumentController::class, 'destroy'])->name('aid.documents.destroy');

    // Admin-only routes
    Route::middleware('admin')->group(function () {
        Route::post('/aid/categories', [DocumentCategoryController::class, 'store'])->name('aid.categories.store');
        Route::delete('/aid/categories/{category}', [DocumentCategoryController::class, 'destroy'])->name('aid.categories.destroy');

        // User Management
        Route::get('/admin/users', [UserManagementController::class, 'index'])->name('admin.users');
        Route::patch('/admin/users/{user}/approve', [UserManagementController::class, 'approve'])->name('admin.users.approve');
        Route::patch('/admin/users/{user}/reject', [UserManagementController::class, 'reject'])->name('admin.users.reject');
    });
});

require __DIR__.'/auth.php';
