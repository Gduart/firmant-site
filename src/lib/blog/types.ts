export type BlogPostStatus = "draft" | "published";

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  coverAlt: string;
  category: string;
  tags: string[];
  content: string;
  status: BlogPostStatus;
  author: string;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BlogPostInput = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  coverAlt: string;
  category: string;
  tags: string[];
  content: string;
  status: BlogPostStatus;
  author: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  publishedAt?: string | null;
};

export type BlogPostRow = Omit<BlogPost, "tags"> & {
  tags: string;
};
