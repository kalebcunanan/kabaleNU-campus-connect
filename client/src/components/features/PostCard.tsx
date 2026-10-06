// client/src/components/features/PostCard.tsx
import React, { useState } from 'react';
import api, { getErrorMessage } from '../../lib/axios';

interface Author {
  _id: string;
  name: string;
  role: string;
}

interface Post {
  _id: string;
  author: Author;
  content: string;
  bulldogReacts: number;
  commentCount: number;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onReactUpdated: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onReactUpdated }) => {
  const [isReacting, setIsReacting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReact = async () => {
    try {
      setIsReacting(true);
      setError(null);
      await api.post(`/posts/${post._id}/react`);
      onReactUpdated(); // Refresh the feed para ma-update ang Hotness Score at counts
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsReacting(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-[#00205B]">{post.author.name}</h4>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            {post.author.role}
          </span>
        </div>
        <span className="text-sm text-gray-400">
          {new Date(post.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>
      
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      
      <div className="flex items-center space-x-4 border-t border-gray-100 pt-3">
        <button 
          onClick={handleReact}
          disabled={isReacting}
          className="flex items-center space-x-1 text-[#00205B] hover:text-blue-700 font-medium disabled:opacity-50 transition-colors"
        >
          <span>🐾 Bulldog React</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{post.bulldogReacts}</span>
        </button>
        
        <div className="flex items-center space-x-1 text-gray-500 text-sm font-medium">
          <span>Comments</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{post.commentCount}</span>
        </div>
      </div>
    </div>
  );
};