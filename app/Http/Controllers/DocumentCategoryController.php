<?php

namespace App\Http\Controllers;

use App\Models\DocumentCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DocumentCategoryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:document_categories,name'],
        ]);

        $category = DocumentCategory::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', "Category \"{$category->name}\" created.");
    }

    public function destroy(DocumentCategory $category)
    {
        $category->delete();

        return back()->with('success', 'Category deleted.');
    }
}
