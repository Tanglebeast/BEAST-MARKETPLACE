import React from 'react';
import { useParams } from 'react-router-dom';
import BlogPosts from '../BlogPosts';
import '../styles/BlogArticlePage.css'; // Import the corresponding CSS file

const BlogArticlePage = () => {
  const { artistname, blogtitle } = useParams(); // Extract artistname and blogtitle from URL parameters

  // Find the blog post based on artistname and blogtitle
  const blogPost = BlogPosts.find(post => 
    post.artist.toLowerCase() === artistname.toLowerCase() && 
    post.title.replace(/\s+/g, '-').toLowerCase() === blogtitle
  );

  if (!blogPost) {
    return <p>Blog post not found.</p>;
  }

  return (
    <div className="blog-article-page centered column">
        <div className='w100 flex centered Blogbanner'>
            <img src={blogPost.image} alt={blogPost.title} className="blog-image" />
        </div>
        <div className='w90 blog-content'>
        <p className="mb0 grey">{blogPost.artist}</p>
      <h1 className='mt0 mb5'>{blogPost.title}</h1>
      <p className="blog-date mt5">{blogPost.date}</p>
      <p className='mt35'>{blogPost.summary}</p>
      </div>
    </div>
  );
};

export default BlogArticlePage;
