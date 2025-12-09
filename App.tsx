import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { User, Post, ChatSession, ChatMessage } from './types';
import { Home } from './pages/Home';
import { Radio } from './pages/Radio';
import { Messages } from './pages/Messages';
import { ChatDetail } from './pages/ChatDetail';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Navigation } from './components/Navigation';
import { CreatePostModal } from './components/CreatePostModal';
import { createPost, getPostsForUser } from './services/postService';
//...
  const handleCreatePost = async (data: Partial<Post>) => {
    if (!user) return;
    
    try {
      const payload = {
        user_id: parseInt(user.id, 10),
        type: data.category || 'text_image', // Assuming category maps to type
        text_content: data.content || '',
        media_urls: data.images || [],
        tags: data.tags || [],
        status: 'published' as 'draft' | 'published',
      };

      const newPost = await createPost(payload);
      setPosts([newPost, ...posts]);
    } catch (error) {
      console.error("Failed to create post:", error);
      // Optionally show an error to the user
    }
  };

   const handleSendMessage = async (sessionId: string, text: string) => {
    // This part is out of scope for the post feature, leaving as is.
    console.log("Sending message:", text);
  };


  return (
    <HashRouter>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <div className="font-sans text-gray-900 mx-auto bg-gray-50 h-screen relative shadow-2xl overflow-hidden max-w-md w-full flex flex-col">
          <div className="flex-1 overflow-y-auto no-scrollbar" id="scrollable-container">
            <Routes>
              <Route path="/" element={
                <div className="pt-safe">
                  <Home 
                    posts={posts} 
                    onLike={handleLike} 
                    onComment={() => {}} 
                    loading={isLoadingPosts && page === 1}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    isLoadingMore={isLoadingPosts}
                  />
                </div>
              } />
              <Route path="/radio" element={<div className="pt-safe"><Radio /></div>} />
              <Route path="/messages" element={<Messages sessions={sessions} />} />
              <Route path="/chat/:id" element={<ChatDetail sessions={sessions} onSendMessage={handleSendMessage} currentUserId={user.id} />} />
              <Route path="/profile" element={<Profile user={user} posts={posts} onLogout={handleLogout} />} />
              <Route path="/create" element={<>
                  <div className="pt-safe">
                     <Home 
                       posts={posts} 
                       onLike={handleLike} 
                       onComment={() => {}} 
                       loading={false} 
                       onLoadMore={() => {}} 
                       hasMore={false}
                       isLoadingMore={false}
                      />
                  </div>
                  <CreatePostWrapper onPost={handleCreatePost} />
                </>} 
              />
            </Routes>
          </div>
          <Navigation />
        </div>
      )}
    </HashRouter>
  );
}

const CreatePostWrapper: React.FC<{ onPost: (data: Partial<Post>) => void }> = ({ onPost }) => {
  const navigate = useNavigate();
  return <CreatePostModal isOpen={true} onClose={() => navigate(-1)} onPost={onPost} />;
}
