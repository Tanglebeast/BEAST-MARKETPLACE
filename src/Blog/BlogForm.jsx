import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Importiere die Styles für ReactQuill
import { artistList } from '../ArtistList';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const BlogForm = ({ onSave, initialData = {}, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    banner: initialData.banner || '',
    content: initialData.content || '',
    author: initialData.author || '',
  });
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errors, setErrors] = useState({ title: false, content: false });
  const [uploading, setUploading] = useState(false); // State für den Upload-Status
  const storage = getStorage();

  useEffect(() => {
    const checkAuthorization = () => {
      const accountAddress = localStorage.getItem('account');
      if (accountAddress) {
        const normalizedAccountAddress = accountAddress.toLowerCase();
        const artist = artistList.find(a => a.walletaddress.toLowerCase() === normalizedAccountAddress);
        if (artist) {
          setFormData(prevData => ({ ...prevData, author: artist.name }));
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, []);

  const handleChange = (value) => {
    setFormData({ ...formData, content: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `banners/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      setUploading(true);

      uploadTask.on(
        'state_changed',
        () => {},
        (error) => {
          console.error("Error uploading image:", error);
          setUploading(false);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFormData({ ...formData, banner: downloadURL });
            setUploading(false);
          });
        }
      );
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { title: false, content: false };

    if (!formData.title.trim()) {
      newErrors.title = true;
      valid = false;
    }

    if (!formData.content.trim()) {
      newErrors.content = true;
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAuthorized) {
      if (validateForm()) {
        onSave({ ...formData }, resetForm);
      }
    } else {
      alert('You are not authorized to create blog posts.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      banner: '',
      content: '',
      author: formData.author, 
    });
    setErrors({ title: false, content: false });
  };

  if (!isAuthorized) {
    return <p>You are not authorized to create blog posts.</p>;
  }

  return (
    <form className='center-ho column BlogFormContainer scroll' onSubmit={handleSubmit}>

      <div className='w100 imageContainerBlog flex centered column'>
        <input
          className='w60'
          type="file"
          name="banner"
          accept="image/*"
          onChange={handleImageUpload}
        />

        <div className='mb10 w60 h200 imageContainerDiv clean'>
          {uploading ? (
            <img src="basic-loading.gif" alt="Loading..." style={{ height: '100px', width: 'auto' }} />
          ) : formData.banner ? (
            <img src={formData.banner} alt="Banner" />
          ) : (
            <div className='PlaceholderBlogIMG'>
                <img src="/picture.png" alt="Banner" />
              <p>Bildplatzhalter</p>
            </div>
          )}
        </div>
      </div>

      <div className='w100'>
        <input
          className={`w60 ${errors.title ? 'error' : ''}`}
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className='w100 centered column'>
        <ReactQuill
          value={formData.content}
          onChange={handleChange}
          placeholder="Content"
          className={`w60 ${errors.content ? 'error' : ''}`}
        />
      </div>
      <div>
        <input
          type="hidden"
          name="author"
          value={formData.author}
        />
      </div>
      <button className='actionbutton mt100' type="submit">
        <h3 className='mt0 mb0 s16'>{isEditing ? 'UPDATE' : 'CREATE'} ARTICLE</h3>
      </button>
      <div className="error-messages mt20">
        {errors.title && <p className="error-message-blog">Title is required.</p>}
        {errors.content && <p className="error-message-blog">Content is required.</p>}
      </div>
    </form>
  );
};

export default BlogForm;
