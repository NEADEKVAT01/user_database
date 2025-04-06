import React, { useRef, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchData, addItems, CHUNK_SIZE, setEditingItem } from '../store/listSlice';
import ErrorBoundary from './ErrorBoundary';
import "../styles/List.css";

/**
 * Main list component with infinite scroll functionality
 */
function ListComponent() {
  const dispatch = useDispatch();
  const { items, allData, loading, error, editingItem } = useSelector(state => state.list);
  const observerRef = useRef();
  const initialized = useRef(false);

  // Fetch data on initial render
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      dispatch(fetchData());
    }
  }, [dispatch]);

  // Load chunks of data for infinite scroll
  const loadChunk = useCallback((chunkIndex) => {
    if (!allData) return [];
    const start = chunkIndex * CHUNK_SIZE;
    const end = start + CHUNK_SIZE;
    return allData.slice(start, Math.min(end, allData.length));
  }, [allData]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (loading || !allData) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          const nextChunk = Math.floor(items.length / CHUNK_SIZE);
          const newItems = loadChunk(nextChunk);
          if (newItems?.length > 0) {
            dispatch(addItems(newItems));
          }
        }
      },
      { threshold: 0.01 }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) observer.observe(currentObserverRef);
    
    return () => {
      if (currentObserverRef) observer.unobserve(currentObserverRef);
      observer.disconnect();
    };
  }, [allData, items.length, loadChunk, loading, dispatch]);

  // Handle item selection
  const handleItemClick = (item) => {
    dispatch(setEditingItem(item));
  };

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw new Error(error);
  }

  return (
    <div className="list-container">
      {loading ? (
        <div className="loading-screen">
          <div className="spinner" />
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          <ul className="item-grid">
            {items.map((item) => (
              <li 
                key={item.id}
                className={`item-card ${editingItem?.id === item.id ? 'active' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <img 
                  className="avatar" 
                  src="/Profile-Male-Transparent.png" 
                  alt={`${item.name} avatar`} 
                />
                <div className="text-content">
                  <h3>{item.name || 'No name'}</h3>
                  <p>
                    <span className="job-title">{item.jobTitle || 'No position'}</span>
                    <span className="separator">|</span>
                    <span className="company">{item.company || 'No company'}</span>
                  </p>
                  <p className="department">{item.department || 'No department'}</p>
                </div>
              </li>
            ))}
          </ul>
          
          <div ref={observerRef} className="scroll-sentinel" />
          
          {items.length < (allData?.length ?? Infinity) && (
            <div className="loading-bar">
              Loading more items...
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Wrap ListComponent with ErrorBoundary
export default function List() {
  return (
    <ErrorBoundary>
      <ListComponent />
    </ErrorBoundary>
  );
}