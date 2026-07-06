<?php

use App\Http\Controllers\DocumentCategoryController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Maintenance / Recovery routes
|--------------------------------------------------------------------------
| Hit these in the browser after a host outage (Hostinger, etc.) when
| pages return 419 | Page Expired or the app appears frozen due to stale
| caches. Kept outside any middleware so they still work when config,
| routes, or sessions are broken.
|
| WARNING: unauthenticated. Anyone who knows the URL can clear caches
| and log out all users. Acceptable trade-off for a small internal app.
|--------------------------------------------------------------------------
*/
Route::prefix('_maint')->group(function () {

    $run = function (array $commands) {
        $output = [];
        foreach ($commands as $cmd) {
            try {
                Artisan::call($cmd);
                $output[] = "[OK] {$cmd}\n" . Artisan::output();
            } catch (\Throwable $e) {
                $output[] = "[FAIL] {$cmd}\n" . $e->getMessage();
            }
        }
        return response('<pre>' . e(implode("\n", $output)) . '</pre>');
    };

    // Individual clears
    Route::get('/cache-clear',   fn () => $run(['cache:clear']));
    Route::get('/config-clear',  fn () => $run(['config:clear']));
    Route::get('/route-clear',   fn () => $run(['route:clear']));
    Route::get('/view-clear',    fn () => $run(['view:clear']));
    Route::get('/event-clear',   fn () => $run(['event:clear']));
    Route::get('/compiled-clear', fn () => $run(['clear-compiled']));

    // Optimize (rebuild caches for prod)
    Route::get('/optimize',       fn () => $run(['optimize']));
    Route::get('/optimize-clear', fn () => $run(['optimize:clear']));

    // Storage symlink (breaks after some host restores)
    Route::get('/storage-link',   fn () => $run(['storage:link']));

    // Fix 419 | Page Expired — clears sessions + all caches, then re-optimizes
    Route::get('/fix-419', function () use ($run) {
        // Wipe active sessions so stale CSRF tokens are dropped
        try {
            $driver = config('session.driver');
            if ($driver === 'database') {
                DB::table(config('session.table', 'sessions'))->truncate();
            } elseif ($driver === 'file') {
                $path = config('session.files', storage_path('framework/sessions'));
                foreach (glob($path . '/*') as $f) {
                    if (is_file($f) && basename($f) !== '.gitignore') @unlink($f);
                }
            }
        } catch (\Throwable $e) {
            // ignore — the cache clears below are still worth running
        }

        return $run([
            'cache:clear',
            'config:clear',
            'route:clear',
            'view:clear',
            'event:clear',
            'clear-compiled',
        ]);
    });

    // Full recovery — clear everything, then re-optimize for production
    Route::get('/fix-all', fn () => $run([
        'cache:clear',
        'config:clear',
        'route:clear',
        'view:clear',
        'event:clear',
        'clear-compiled',
        'optimize',
    ]));
});

Route::get('/clear-all', function() {
    try {
        // 1. Clear Laravel Caches
        Artisan::call('cache:clear');
        Artisan::call('config:clear');
        Artisan::call('route:clear');
        Artisan::call('view:clear');

        // 2. Clear Compiled Classes
        Artisan::call('clear-compiled');

        // 3. Clear Cache Facade
        Cache::flush();

        // 4. Clear Application Cache Directory
        $cacheDir = storage_path('framework/cache');
        if (File::exists($cacheDir)) {
            File::cleanDirectory($cacheDir);
        }

        // 5. Recreate Bootstrap Cache
        Artisan::call('optimize:clear');

        // 6. Clear and Regenerate Route Cache
        try {
            Artisan::call('route:cache');
        } catch (\Exception $e) {
            // If route caching fails, just continue
        }

        // 7. Clear and Regenerate Config Cache
        try {
            Artisan::call('config:cache');
        } catch (\Exception $e) {
            // If config caching fails, just continue
        }

        // 8. Clear OPcache if available
        if (function_exists('opcache_reset')) {
            opcache_reset();
        }

        // 9. Clear Realpath Cache
        clearstatcache(true);

        return response()->json([
            'success' => true,
            'message' => 'All caches have been cleared successfully',
            'details' => [
                'cache_clear' => trim(Artisan::output()),
                'time' => now()->toDateTimeString(),
                'note' => 'You may need to wait a few minutes for Hostinger\'s server cache to fully clear'
            ]
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error while clearing caches',
            'error' => $e->getMessage()
        ], 500);
    }
});

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

// Requires an approved account — all roles (management, admin_assistant, admin)
Route::middleware(['auth', 'approved'])->group(function () {
    // Secure document file serving — session-gated, no public URL
    Route::get('/secure/documents/{document}', [DocumentController::class, 'serve'])
        ->name('aid.documents.serve');

    Route::get('/dashboard', function () {
        $categories = \App\Models\DocumentCategory::with(['documents.uploader'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Dashboard', [
            'categories' => $categories,
        ]);
    })->name('dashboard');

    // AID — blocked for management role
    Route::middleware('not_management')->group(function () {
        Route::get('/aid', [DocumentController::class, 'index'])->name('aid.index');
        Route::post('/aid/documents', [DocumentController::class, 'store'])->name('aid.documents.store');
        Route::delete('/aid/documents/{document}', [DocumentController::class, 'destroy'])->name('aid.documents.destroy');

        // Category creation — admin + admin_assistant
        Route::post('/aid/categories', [DocumentCategoryController::class, 'store'])->name('aid.categories.store');

        // Admin-only routes
        Route::middleware('admin')->group(function () {
            Route::delete('/aid/categories/{category}', [DocumentCategoryController::class, 'destroy'])->name('aid.categories.destroy');

            // User Management
            Route::get('/admin/users', [UserManagementController::class, 'index'])->name('admin.users');
            Route::patch('/admin/users/{user}/approve', [UserManagementController::class, 'approve'])->name('admin.users.approve');
            Route::patch('/admin/users/{user}/reject', [UserManagementController::class, 'reject'])->name('admin.users.reject');
        });
    });
});

require __DIR__.'/auth.php';
