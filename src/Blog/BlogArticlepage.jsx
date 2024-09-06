// BlogArticlePage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/Blogarticlepage.css'

const BlogArticlePage = () => {
  const { blogId } = useParams();
  const [blogPost, setBlogPost] = useState(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      const docRef = doc(db, 'blogPosts', blogId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBlogPost({ id: docSnap.id, ...docSnap.data() });
      } else {
        setBlogPost(null);
      }
    };

    fetchBlogPost();
  }, [blogId]);

  if (!blogPost) {
    return <p>Blog post not found.</p>;
  }

  const formattedCreatedAt = blogPost.createdAt.toDate().toLocaleDateString();
  const formattedUpdatedAt = blogPost.updatedAt.toDate().toLocaleDateString(); // Mit Zeit

  return (
    <div className="blog-article-page centered column">
      <div className="w100 flex centered Blogbanner">
        <img src={blogPost.banner} alt={blogPost.title} className="blog-image" />
      </div>
      <div className="w90 blog-content">
      {/* <p>Created: {formattedCreatedAt}</p> Nur Datum ohne Uhrzeit */}
      {/* <p className='grey mb30i'>{formattedUpdatedAt}</p> Mit Datum und Uhrzeit */}
        <p className="mb0">Article written by {blogPost.author}</p>
        <h1 className="mt0 mb5i blog-page-titleh1">{blogPost.title}</h1>
        <p className='grey'>Created / Edited at {formattedUpdatedAt}</p>
        <div className="mt35" dangerouslySetInnerHTML={{ __html: blogPost.content }} />
      </div>
    </div>
  );
};

export default BlogArticlePage;
