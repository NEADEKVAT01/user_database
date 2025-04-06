import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setEditingItem, updateItemLocally, saveItemToServer, resetError } from '../store/listSlice';
import "../styles/UserForm.css";

/**
 * Form component for editing employee details
 */
const UserForm = () => {
  const dispatch = useDispatch();
  const selectedItem = useSelector(state => state.list.editingItem);
  const saveStatus = useSelector(state => state.list.saveStatus);
  const error = useSelector(state => state.list.error);
  
  // Local form state
  const [localItem, setLocalItem] = useState({
    id: '',
    name: '',
    jobTitle: '',
    department: '',
    company: ''
  });

  // Success message visibility
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync form with selected item
  useEffect(() => {
    if (selectedItem) {
      setLocalItem({
        id: selectedItem.id || '',
        name: selectedItem.name || '',
        jobTitle: selectedItem.jobTitle || '',
        department: selectedItem.department || '',
        company: selectedItem.company || ''
      });
      setShowSuccess(false);
    } else {
      setLocalItem({
        id: '',
        name: '',
        jobTitle: '',
        department: '',
        company: ''
      });
    }
  }, [selectedItem]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    let timer;
    if (saveStatus === 'succeeded') {
      setShowSuccess(true);
      timer = setTimeout(() => setShowSuccess(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [saveStatus]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalItem(prev => ({ ...prev, [name]: value }));
  };

  // Save employee data
  const handleSave = async () => {
    if (!localItem.id) return;
    try {
      dispatch(updateItemLocally(localItem));
      dispatch(saveItemToServer(localItem));
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setLocalItem({
      id: '',
      name: '',
      jobTitle: '',
      department: '',
      company: ''
    });
    dispatch(setEditingItem(null));
    dispatch(resetError());
    setShowSuccess(false);
  };

  return (
    <div className='UserForm'>
      <h1>{localItem.name || "No employee selected"}</h1>
      
      {selectedItem && (
        <div className="form-container">
          <label>Full Name</label>
          <input 
            type='text' 
            name='name' 
            value={localItem.name} 
            onChange={handleInputChange}
            required
          />
          <label>Job Title</label>
          <input 
            type='text' 
            name='jobTitle' 
            value={localItem.jobTitle} 
            onChange={handleInputChange}
            required
          />
          <label>Department</label>
          <input 
            type='text' 
            name='department' 
            value={localItem.department} 
            onChange={handleInputChange}
            required
          />
          <label>Company</label>
          <input 
            type='text' 
            name='company' 
            value={localItem.company} 
            onChange={handleInputChange}
            required
          />
          <div className="button-group">
            <button 
              type="button" 
              onClick={handleSave}
              disabled={saveStatus === 'loading'}
              className="save-btn"
            >
              {saveStatus === 'loading' ? 'Saving...' : 'Save'}
            </button>
            <button 
              type="button" 
              onClick={handleCancel}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
          {error && <div className="error">{error}</div>}
            <div className={`success ${showSuccess ? 'shown' : ''}`}>✔️ Saved ✔️</div>
        </div>
      )}
    </div>
  );
};

export default UserForm;