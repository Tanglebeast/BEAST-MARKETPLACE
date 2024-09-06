// PublicBlogPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import '../styles/PublicBlogPage.css';  // Importing a CSS file for styling

const PublicBlogPage = ({ author }) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'blogPosts'));
        const posts = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt)
          };
        });
        // Check if the current URL contains "/articles"
        const shouldFilter = !location.pathname.includes('/articles');
        // Filter posts by the provided author only if not on "/articles"
        const filteredPosts = shouldFilter && author
          ? posts.filter(post => post.author.toLowerCase() === author.toLowerCase())
          : posts;
        setBlogPosts(filteredPosts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false); // Set loading to false once the data is fetched
      }
    };

    fetchBlogPosts();
  }, [author, location.pathname]); // Re-run the effect if author or location.pathname changes

  const handleView = (id) => {
    navigate(`/articles/${id}`);
  };

  return (
    <div className="blogPageWrapper">
      <header className="pageHeader">
        <h2 className="pageHeaderTitle">
          {author ? `${author.toUpperCase()}' S ARTICLES` : 'ARTICLES'}
        </h2> {/* Dynamic heading with uppercase author name */}
      </header>

      {loading ? (
        <div className="loading-container">
          <img src="/loading.gif" alt="Loading..." className="loadingGif" />
        </div>
      ) : blogPosts.length === 0 ? (
        <div className="noPostsMessage">
          <p>No blog posts available</p>
        </div>
      ) : (
        <div className="postsGrid">
          {blogPosts.map((post) => (
            <div className="blogCard" key={post.id}>
                <div className='blogPostCradBannerimg'>
                <img src={post.banner} alt={post.title} className="blog-image-card" />
                </div>
              <h2 className="blogTitle">{post.title}</h2>
              <p className="blogExcerpt" dangerouslySetInnerHTML={{ __html: post.content.substring(0, 100) + '...' }}></p>
              <div className='flex center-ho space-between'>
                <button className="viewPostButton" onClick={() => handleView(post.id)}><h3 className='mb0 mt0'>Read More</h3></button>

                <div className="blogTimestamps text-align-right">
                  <p className="blogAuthor mb5">Written by {post.author}</p>
                  <p className='grey mb0'>Created / Updated at {new Date(post.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicBlogPage;
