'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  categories: string[];
  tags: string[];
  featuredImage?: string;
  publishedAt?: string;
  createdAt: string;
  authorId: number;
  viewCount: number;
}

interface BlogFilters {
  categories: Array<{ name: string; postCount: number }>;
  tags: Array<{ name: string; postCount: number }>;
}

interface BlogResponse {
  posts: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: BlogFilters;
}

export function BlogListing() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filters, setFilters] = useState<BlogFilters>({ categories: [], tags: [] });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const fetchPosts = async (page = 1, search = '', category = '', tag = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(category && { category }),
        ...(tag && { tag }),
      });

      const response = await fetch(`/api/v1/content/posts?${params}`);
      const data: BlogResponse = await response.json();

      setPosts(data.posts);
      setFilters(data.filters);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = () => {
    fetchPosts(1, searchQuery, selectedCategory, selectedTag);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchPosts(1, searchQuery, category, selectedTag);
  };

  const handleTagChange = (tag: string) => {
    setSelectedTag(tag);
    fetchPosts(1, searchQuery, selectedCategory, tag);
  };

  const handlePageChange = (page: number) => {
    fetchPosts(page, searchQuery, selectedCategory, selectedTag);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-lg text-gray-600">
          Stay updated with the latest real estate insights and market trends
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {filters.categories
                .filter((category) => category.name && category.name.trim() !== '')
                .map((category) => (
                <SelectItem key={category.name} value={category.name}>
                  {category.name} ({category.postCount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={handleTagChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {filters.tags
                .filter((tag) => tag.name && tag.name.trim() !== '')
                .slice(0, 10)
                .map((tag) => (
                <SelectItem key={tag.name} value={tag.name}>
                  {tag.name} ({tag.postCount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No blog posts found.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {post.featuredImage && (
                  <div className="aspect-video overflow-hidden">
                    <Image
                      src={post.featuredImage}
                      alt={post.title || "Blog post featured image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.categories.slice(0, 2).map((category) => (
                      <Badge key={category} variant="secondary" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    <span>{post.viewCount} views</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  {pagination.page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pagination.page - 1);
                        }}
                      />
                    </PaginationItem>
                  )}

                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter((page) => {
                      const current = pagination.page;
                      return page === 1 || page === pagination.pages || Math.abs(page - current) <= 2;
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              isActive={page === pagination.page}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        </React.Fragment>
                      );
                    })}

                  {pagination.page < pagination.pages && (
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pagination.page + 1);
                        }}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}