import React, { useState, useEffect } from 'react';
import BlogForm from './BlogForm';
import PopupContainer from './BlogFormPupup'; // Importiere PopupContainer
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { artistList } from '../ArtistList';
import '../styles/BloglistPage.css';

const BlogListPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authorizedAddress, setAuthorizedAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('create'); // Zustand für die Ansicht (Erstellen/Verwalten)
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Neuer Zustand für das Popup
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogPosts = async () => {
      setLoading(true);
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

        const filteredPosts = posts.filter(post => post.authorWalletAddress === authorizedAddress);
        setBlogPosts(filteredPosts);
        console.log('Fetched and filtered blog posts:', filteredPosts);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [authorizedAddress]);

  useEffect(() => {
    const checkAuthorization = () => {
      const accountAddress = localStorage.getItem('account');
      if (accountAddress) {
        const normalizedAccountAddress = accountAddress.toLowerCase();
        console.log('Checking authorization for account:', normalizedAccountAddress);
        const artist = artistList.find(a => a.walletaddress.toLowerCase() === normalizedAccountAddress);
        if (artist) {
          console.log('Authorization successful. Artist found:', artist);
          setIsAuthorized(true);
          setAuthorizedAddress(artist.walletaddress.toLowerCase());
        } else {
          console.log('Authorization failed. Artist not found.');
          setIsAuthorized(false);
        }
      } else {
        console.log('No account address found in local storage.');
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, []);

  const handleSave = async (newPost, resetForm) => {
    try {
      if (editingPost !== null) {
        const postId = blogPosts[editingPost].id;

        console.log('Updating blog post with ID:', postId);

        const postDoc = doc(db, 'blogPosts', postId);
        await updateDoc(postDoc, {
          ...newPost,
          updatedAt: Timestamp.fromDate(new Date()),
        });

        const updatedPosts = [...blogPosts];
        updatedPosts[editingPost] = {
          id: postId,
          ...newPost,
          updatedAt: new Date(),
        };
        setBlogPosts(updatedPosts);
        setEditingPost(null);
        console.log('Blog post updated:', { id: postId, ...newPost });
      } else {
        const postId = newPost.title.replace(/\s+/g, '_').toLowerCase();
        console.log('Saving new blog post with ID:', postId);

        await setDoc(doc(db, 'blogPosts', postId), {
          ...newPost,
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
          authorWalletAddress: authorizedAddress,
        });

        setBlogPosts([
          ...blogPosts,
          {
            id: postId,
            ...newPost,
            createdAt: new Date(),
            updatedAt: new Date(),
            authorWalletAddress: authorizedAddress,
          },
        ]);
        console.log('New blog post added:', { id: postId, ...newPost });
      }

      resetForm();
    } catch (error) {
      console.error('Error saving blog post:', error);
    }
  };

  const handleEdit = (index) => {
    console.log('Editing post at index:', index);
    setEditingPost(index);
    setViewType('create'); // Schalte auf den Artikel-Erstellungsmodus um
    setIsPopupOpen(true); // Öffne das Popup
  };

  const handleDelete = async (index) => {
    try {
      await deleteDoc(doc(db, 'blogPosts', blogPosts[index].id));
      const updatedPosts = blogPosts.filter((_, i) => i !== index);
      setBlogPosts(updatedPosts);
      console.log('Blog post deleted at index:', index);
    } catch (error) {
      console.error('Error deleting blog post:', error);
    }
  };

  const handleView = (index) => {
    console.log('Viewing post at index:', index);
    navigate(`/articles/${blogPosts[index].id}`);
  };

  const handleOpenPopup = (type) => {
    setViewType(type);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setViewType(null); // Setze den viewType zurück
  };

  return (
    <div className='BlogListDiv w100 column flex centered'>
      {/* Buttons zum Öffnen des Popups für beide Ansichten */}
      <button className='blogmenubutton' onClick={() => handleOpenPopup('create')}>Create Article</button>
      <button className='blogmenubutton' onClick={() => handleOpenPopup('manage')}>Manage Articles</button>

      {isPopupOpen && (
        <PopupContainer onClose={handleClosePopup}>
          <div className='w100'>
            {/* Menu zum Wechseln der Ansichten */}
            <button className='blogmenubutton' onClick={() => setViewType('create')}>Create Article</button>
            <button className='blogmenubutton' onClick={() => setViewType('manage')}>Manage Articles</button>
          </div>

          {viewType === 'create' ? (
            <>
              <h2 className='mb0'>Create an Article</h2>
              {isAuthorized ? (
                <>
                  {editingPost !== null ? (
                    <BlogForm
                      onSave={handleSave}
                      initialData={blogPosts[editingPost]}
                      isEditing={true}
                    />
                  ) : (
                    <BlogForm onSave={handleSave} />
                  )}
                </>
              ) : (
                <p>You are not authorized to create or edit blog posts.</p>
              )}
            </>
          ) : viewType === 'manage' ? (
            <>
            <div className='BlogFormContainer'>
              <h2 className='mt10'>Manage your Articles</h2>
              {loading ? (
                <div className="loading-container">
                  <img src="/loading.gif" alt="Loading..." className="loading-gif" />
                </div>
              ) : (
                <div className='BlogPostContainer w100 scrollContainerBlog'>
                  {blogPosts.length > 0 ? (
                    blogPosts.map((post, index) => (
                      <div className='BlogPostCards' key={post.id}>
                        <div className='blogPostCradBannerimg-manage'>
                        <img src={post.banner} alt={post.title} className="blog-image-card" />
                        </div>
                        <h3>{post.title}</h3>
                        <p className='grey'>
                          {post.updatedAt.getTime() === post.createdAt.getTime()
                            ? `${new Date(post.createdAt).toLocaleString()}`
                            : `${new Date(post.updatedAt).toLocaleString()}`}
                        </p>
                        <div className='w100'>
                          <button className='BlogActionButton' onClick={() => handleView(index)}>View</button>
                          {isAuthorized && (
                            <>
                              <button className='BlogActionButton' onClick={() => handleEdit(index)}>Edit</button>
                              <button className='BlogActionButton red' onClick={() => handleDelete(index)}>Delete</button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='w100 centered'>No articles created yet...</p>
                  )}
                </div>
              )}
              </div>
            </>
          ) : null}
        </PopupContainer>
      )}
    </div>
  );
};

export default BlogListPage;
