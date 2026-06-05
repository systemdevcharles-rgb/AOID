<?php

namespace App\Console\Commands;

use App\Models\Document;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class MigrateDocumentsToPrivateStorage extends Command
{
    protected $signature   = 'aid:secure-files';
    protected $description = 'Move existing documents from public/uploads into private storage';

    public function handle(): int
    {
        $documents = Document::whereRaw("file_path LIKE 'uploads/aid-documents/%'")->get();

        if ($documents->isEmpty()) {
            $this->info('No documents need to be migrated.');
            return self::SUCCESS;
        }

        $this->info("Found {$documents->count()} document(s) to migrate...");
        $bar = $this->output->createProgressBar($documents->count());
        $bar->start();

        $moved   = 0;
        $missing = 0;

        foreach ($documents as $doc) {
            $filename   = basename($doc->file_path);
            $oldAbsPath = public_path($doc->file_path);
            $newRelPath = 'aid-documents/' . $filename;

            if (file_exists($oldAbsPath)) {
                // Copy into private storage
                Storage::disk('local')->put($newRelPath, file_get_contents($oldAbsPath));

                // Remove from public
                unlink($oldAbsPath);

                // Update DB record
                $doc->update(['file_path' => $newRelPath]);
                $moved++;
            } else {
                // File already gone — just fix the DB path if possible
                if (Storage::disk('local')->exists($newRelPath)) {
                    $doc->update(['file_path' => $newRelPath]);
                }
                $missing++;
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Done. Moved: {$moved} | Already missing from public: {$missing}");

        // Clean up the now-empty public directory
        $dir = public_path('uploads/aid-documents');
        if (is_dir($dir) && count(array_diff(scandir($dir), ['.', '..'])) === 0) {
            rmdir($dir);
            $this->info('Removed empty public/uploads/aid-documents directory.');
        }

        return self::SUCCESS;
    }
}
