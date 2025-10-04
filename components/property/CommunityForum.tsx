import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Plus, User, Reply } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface ForumPost {
  id: number;
  user_id: number;
  property_id?: number;
  title: string;
  content: string;
  replies?: Array<{
    user_id: number;
    content: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
  user: {
    first_name?: string;
    last_name?: string;
  };
}

interface CommunityForumProps {
  propertyId?: number; // Optional - if not provided, shows all forum posts
}

export function CommunityForum({ propertyId }: CommunityForumProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    content: ""
  });
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [newReply, setNewReply] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, [propertyId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const url = propertyId
        ? `/api/v1/properties/${propertyId}/forum`
        : '/api/v1/forum/posts';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching forum posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await fetch('/api/v1/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPost,
          property_id: propertyId,
        }),
      });

      if (response.ok) {
        setNewPost({ title: "", content: "" });
        setShowNewPostForm(false);
        await fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleReply = async (postId: number) => {
    if (!user || !newReply.trim()) return;

    try {
      const response = await fetch(`/api/v1/forum/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newReply }),
      });

      if (response.ok) {
        setNewReply("");
        setSelectedPost(null);
        await fetchPosts();
      }
    } catch (error) {
      console.error('Error replying to post:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Community Forum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Community Forum
          </CardTitle>
          {user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewPostForm(!showNewPostForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Connect with other buyers and sellers. Share experiences and ask questions.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {showNewPostForm && user && (
          <Card className="border-2 border-blue-200">
            <CardContent className="pt-6">
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Post title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <textarea
                    value={newPost.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="What's on your mind?"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowNewPostForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Post</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {posts.map((post) => (
          <Card key={post.id} className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {post.user.first_name || 'Anonymous'}
                      </span>
                      {post.property_id && (
                        <Badge variant="outline" className="text-xs">
                          Property Discussion
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-700 mb-4">{post.content}</p>

                  {post.replies && post.replies.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {post.replies.map((reply, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-600" />
                            </div>
                            <span className="text-xs font-medium">Anonymous</span>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {user && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                      >
                        <Reply className="h-4 w-4 mr-2" />
                        Reply
                      </Button>
                      {post.replies && post.replies.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {post.replies.length} replies
                        </span>
                      )}
                    </div>
                  )}

                  {selectedPost?.id === post.id && user && (
                    <div className="mt-4 space-y-2">
                      <textarea
                        value={newReply}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewReply(e.target.value)}
                        placeholder="Write a reply..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPost(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReply(post.id)}
                          disabled={!newReply.trim()}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No discussions yet. Start the conversation!</p>
          </div>
        )}

        {!user && (
          <div className="border-t pt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Join the community to participate in discussions
            </p>
            <Button variant="outline">
              Sign In to Join Discussion
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}