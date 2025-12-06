import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabaseClient';

const BlogForm = ({ onClose, onSuccess, initial = {} }) => {
  const [title, setTitle] = useState(initial.title || '');
  const [summary, setSummary] = useState(initial.summary || '');
  const [content, setContent] = useState(initial.content || '');
  const [category, setCategory] = useState(initial.category || 'environment');
  const [coverImage, setCoverImage] = useState(initial.cover_image || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      // ensure we have a current user as author
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userData?.user;
      const author_id = user?.id ?? initial.author_id ?? null;

      const payload = {
        title: title.trim(),
        summary: summary.trim() || title.trim().slice(0, 160),
        content: content.trim(),
        category: category || null,
        cover_image: coverImage || null,
        author_id: author_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error: insertErr } = await supabase
        .from('blogs')
        .insert(payload)
        .select()
        .single();

      if (insertErr) throw insertErr;

      if (onSuccess) onSuccess(data);
    } catch (err) {
      console.error('Failed to create blog', err);
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={initial.id ? 'Edit Blog Post' : 'Write New Blog Post'}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => { if (onClose) onClose(); }}
      />

      {/* Modal content */}
      <div
        className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">{initial.id ? 'Edit Blog Post' : 'Write New Blog Post'}</h3>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter blog title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Short summary (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. environment, sustainability"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover image URL</label>
            <input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Write your blog content..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Publishing...' : (initial.id ? 'Update Post' : 'Publish Post')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body);
  }

  return null;
};

export default BlogForm;

