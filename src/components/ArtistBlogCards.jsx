import React from 'react';
import { useParams, Link } from 'react-router-dom';
import BlogPosts from '../BlogPosts';
import '../styles/ArtistBlogCards.css'; // Import the corresponding CSS file

const ArtistBlogCards = () => {
  const { artistname } = useParams(); // Extract artistname from URL parameters

  // Filter blog posts to only include those matching the artist's name
  const filteredBlogPosts = BlogPosts.filter(post => post.artist.toLowerCase() === artistname.toLowerCase());

  return (
    <div className="artist-blog-cards column centered mt35">
        <h2>{artistname.toUpperCase()}'S ARTICLES</h2>
        <div className='flex center-ho gap10 mediacolumn2'>
          {filteredBlogPosts.length > 0 ? (
            filteredBlogPosts.map(post => (
              <div key={post.id} className="blog-card">
                <Link to={`/artist/${artistname}/blog/${post.title.replace(/\s+/g, '-').toLowerCase()}`}>
                <div className='blogimagediv'>
                  <img src={post.image} alt={post.title} className="blog-image" />
                  </div>
                  <div className="blog-content">
                    <h3 className="blog-title">{post.title}</h3>
                    <p className="blog-date">{post.date}</p>
                    {/* <p className="blog-summary">{post.summary}</p> */}
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p>No blog posts available for this artist.</p>
          )}
        </div>
    </div>
  );
};

export default ArtistBlogCards;
