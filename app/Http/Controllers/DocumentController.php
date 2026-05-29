<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index()
    {
        $categories = DocumentCategory::with(['documents.uploader', 'creator'])
            ->orderBy('name')
            ->get();

        return Inertia::render('AID/Index', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:document_categories,id'],
            'title'       => ['required', 'string', 'max:255'],
            'file'        => ['required', 'file', 'max:20480', 'mimes:pdf,doc,docx,jpg,jpeg,png'],
        ]);

        $category = DocumentCategory::findOrFail($validated['category_id']);

        $file     = $request->file('file');
        $path     = $file->store('aid-documents', 'public');
        $control  = $this->generateControlNumber($category->name);

        Document::create([
            'category_id'    => $validated['category_id'],
            'title'          => $validated['title'],
            'file_path'      => $path,
            'file_name'      => $file->getClientOriginalName(),
            'file_type'      => $file->getClientMimeType(),
            'file_size'      => $file->getSize(),
            'control_number' => $control,
            'uploaded_by'    => $request->user()->id,
        ]);

        return back()->with('success', "Document attached. Control No: {$control}");
    }

    public function destroy(Document $document, Request $request)
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            $request->validate([
                'reason' => ['required', 'string', 'min:10', 'max:500'],
            ]);

            \Illuminate\Support\Facades\Log::info('Document deletion by admin assistant', [
                'document_id'    => $document->id,
                'document_title' => $document->title,
                'deleted_by'     => $user->id,
                'deleted_by_name'=> $user->name,
                'reason'         => $request->reason,
                'deleted_at'     => now(),
            ]);
        }

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return back()->with('success', 'Document removed.');
    }

    private function generateControlNumber(string $categoryName): string
    {
        $upper  = strtoupper($categoryName);
        $random = strtoupper(Str::random(6));
        $date   = now()->format('Ymd-His');

        return "{$upper} NO. AID-{$random} {$date}";
    }
}
