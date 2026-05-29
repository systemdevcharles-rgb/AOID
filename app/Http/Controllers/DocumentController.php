<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentCategory;
use Illuminate\Http\Request;
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
            'category_id'    => ['required', 'exists:document_categories,id'],
            'title'          => ['required', 'string', 'max:255'],
            'control_number' => ['required', 'string', 'max:255', 'unique:documents,control_number'],
            'file'           => ['required', 'file', 'max:20480', 'mimes:pdf,doc,docx,jpg,jpeg,png'],
        ]);

        $file      = $request->file('file');
        $filename  = time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
        $uploadDir = public_path('uploads/aid-documents');

        if (! is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $file->move($uploadDir, $filename);
        $relativePath = 'uploads/aid-documents/' . $filename;

        Document::create([
            'category_id'    => $validated['category_id'],
            'title'          => $validated['title'],
            'control_number' => $validated['control_number'],
            'file_path'      => $relativePath,
            'file_name'      => $file->getClientOriginalName(),
            'file_type'      => $file->getClientMimeType(),
            'file_size'      => $file->getSize(),
            'uploaded_by'    => $request->user()->id,
        ]);

        return back()->with('success', 'Document attached.');
    }

    public function destroy(Document $document, Request $request)
    {
        $user = $request->user();

        if (! $user->isAdmin()) {
            $request->validate([
                'reason' => ['required', 'string', 'min:10', 'max:500'],
            ]);

            \Illuminate\Support\Facades\Log::info('Document deletion by admin assistant', [
                'document_id'     => $document->id,
                'document_title'  => $document->title,
                'deleted_by'      => $user->id,
                'deleted_by_name' => $user->name,
                'reason'          => $request->reason,
                'deleted_at'      => now(),
            ]);
        }

        $fullPath = public_path($document->file_path);
        if (file_exists($fullPath)) {
            unlink($fullPath);
        }

        $document->delete();

        return back()->with('success', 'Document removed.');
    }
}
