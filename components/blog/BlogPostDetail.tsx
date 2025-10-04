'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Calendar, Eye, MessageSquare, User } from 'lucide-react';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  categories: string[];
  tags: string[];
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  authorId: number;
  viewCount: number;
  commentCount: number;
  comments: Comment[];
}

interface Comment {
  _id: string;
  postId: string;
  authorName: string;
  content: string;
  status: string;
  createdAt: string;
}

interface BlogPostDetailProps {
  slug: string;
}

export function BlogPostDetail({ slug }: BlogPostDetailProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/content/posts/${slug}`);
      if (!response.ok) {
        throw new Error('Post not found');
      }
      const data = await response.json();
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      router.push('/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !post) return;

    setSubmittingComment(true);
    try {
      const response = await fetch('/api/v1/content/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post._id,
          content: commentContent.trim(),
          authorName: 'Anonymous', // In a real app, this would come from user auth
        }),
      });

      if (response.ok) {
        setCommentContent('');
        // Refresh post to show new comment
        fetchPost();
      } else {
        console.error('Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/blog">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>

      <article className="max-w-4xl mx-auto">
        {/* Post header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.publishedAt || post.createdAt)}
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {post.viewCount} views
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {post.commentCount} comments
            </div>
          </div>

          {post.featuredImage && (
            <div className="aspect-video overflow-hidden rounded-lg mb-6 relative">
              <Image
                src={post.featuredImage}
                alt={post.title || "Blog post featured image"}
                fill
                className="object-cover"
                sizes="(max-width: 1200px) 100vw, 1200px"
                priority
              />
            </div>
          )}
        </header>

        {/* Post content */}
        <div
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Comments section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Comments ({post.commentCount})</h2>

          {/* Comment form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Leave a Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  placeholder="Write your comment here..."
                  value={commentContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <Button type="submit" disabled={submittingComment || !commentContent.trim()}>
                  {submittingComment ? <LoadingSpinner /> : 'Submit Comment'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Comments list */}
          <div className="space-y-4">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <Card key={comment._id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{comment.authorName}</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </section>
      </article>
    </div>
  );
}