import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Calendar,
  User,
  ArrowLeft,
  Edit,
  Trash2,
  Share,
  Heart,
  MessageCircle
} from 'lucide-react';

const BlogDetail = ({ navigate, blogId }) => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchBlog = async () => {
      try {
        setLoading(true);
        
        // Fetch current user (optional, may be null if not logged in)
        const { data: { user } } = await supabase.auth.getUser();
        if (mounted) setCurrentUser(user);

        // Fetch blog
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', blogId)
          .single();

        if (error) throw error;
        if (mounted) setBlog(data);
      } catch (error) {
        console.error('Error fetching blog:', error);
        if (mounted) setError(error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (blogId) fetchBlog();
    return () => { mounted = false; };
  }, [blogId]);

  const handleEdit = () => {
    navigate('edit-blog', { id: blogId });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);

      if (error) throw error;
      navigate('blogs');
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog post');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading Blog
          </h1>
          <p className="text-gray-600 mb-6">{error || 'Blog not found'}</p>
          <button
            onClick={() => navigate('blogs')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('blogs')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Blogs
        </button>

        {/* Article Header */}
        <article>
          {blog.cover_image && (
            <img
              src={blog.cover_image}
              alt={blog.title}
              className="w-full h-64 object-cover rounded-xl mb-8"
            />
          )}

          <div className="flex justify-between items-start mb-6">
            <h1 className="text-4xl font-bold text-gray-900">{blog.title}</h1>
            
            {/* Edit/Delete buttons for author */}
            {currentUser?.id === blog.author_id && (
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-red-50"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Meta Information */}
          <div className="flex items-center gap-6 text-gray-600 mb-8">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{formatDate(blog.created_at)}</span>
            </div>
            {blog.category && (
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                {blog.category}
              </span>
            )}
          </div>

          {/* Blog Content */}
          <div className="prose prose-green max-w-none">
            {blog.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Social Actions */}
          <div className="flex items-center gap-6 mt-8 pt-6 border-t">
            <button className="flex items-center gap-2 text-gray-600 hover:text-red-600">
              <Heart className="h-5 w-5" />
              <span>Like</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
              <Share className="h-5 w-5" />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-green-600">
              <MessageCircle className="h-5 w-5" />
              <span>Comment</span>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogDetail;