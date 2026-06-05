<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

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
            'control_number' => ['required', 'string', 'max:255', 'unique:documents,control_number'],
            'title'          => ['required', 'string', 'max:255'],
            'details'        => ['nullable', 'string', 'max:2000'],
            'file'           => ['required', 'file', 'max:20480', 'mimes:pdf,doc,docx,jpg,jpeg,png'],
        ]);

        $file         = $request->file('file');
        $filename     = time() . '_' . Str::random(8) . '.' . $file->getClientOriginalExtension();
        $originalName = $file->getClientOriginalName();
        $mimeType     = $file->getClientMimeType();
        $fileSize     = $file->getSize();

        // Store in private storage — not web-accessible
        $storedPath = Storage::disk('local')->putFileAs('aid-documents', $file, $filename);

        Document::create([
            'category_id'    => $validated['category_id'],
            'control_number' => $validated['control_number'],
            'title'          => $validated['title'],
            'details'        => $validated['details'] ?? null,
            'file_path'      => $storedPath,
            'file_name'      => $originalName,
            'file_type'      => $mimeType,
            'file_size'      => $fileSize,
            'uploaded_by'    => $request->user()->id,
        ]);

        return back()->with('success', 'Document attached.');
    }

    /**
     * Serve a document — requires an active authenticated session.
     * Adds X-Robots-Tag so search engines cannot index the file.
     */
    public function serve(Document $document): Response
    {
        // Resolve file path: new private storage first, old public fallback
        $privatePath = Storage::disk('local')->path($document->file_path);
        $publicPath  = public_path($document->file_path);

        if (file_exists($privatePath)) {
            $path = $privatePath;
        } elseif (file_exists($publicPath)) {
            $path = $publicPath;
        } else {
            abort(404);
        }

        $mime = $document->file_type ?? mime_content_type($path);

        return response()->file($path, [
            'Content-Type'  => $mime,
            'X-Robots-Tag'  => 'noindex, nofollow, noarchive',
            'Cache-Control' => 'private, no-store, no-cache',
            'Pragma'        => 'no-cache',
        ]);
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

        // Delete from private storage
        if (Storage::disk('local')->exists($document->file_path)) {
            Storage::disk('local')->delete($document->file_path);
        } else {
            // Fallback: old public path
            $publicPath = public_path($document->file_path);
            if (file_exists($publicPath)) {
                unlink($publicPath);
            }
        }

        $document->delete();

        return back()->with('success', 'Document removed.');
    }
}
