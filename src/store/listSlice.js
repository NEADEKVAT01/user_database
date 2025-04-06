import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const CHUNK_SIZE = 100;
const API_BASE = 'http://localhost:3001/employees';

/**
 * Fetch employee data from server
 */
export const fetchData = createAsyncThunk(
  'list/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_BASE, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to fetch data');
      }
      
      return await response.json();
    } catch (err) {
      console.error('Fetch error:', err);
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Save updated employee data to server
 */
export const saveItemToServer = createAsyncThunk(
  'items/update',
  async (item, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE}/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          console.error('Failed to parse error response', e);
        }
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error) {
      console.error('Save failed:', error);
      return rejectWithValue({
        message: error.message.includes('Failed to fetch') 
          ? 'Network error - could not connect to server'
          : error.message,
        item
      });
    }
  }
);

/**
 * Redux slice for employee list management
 */
export const listSlice = createSlice({
  name: 'list',
  initialState: {
    allData: [],
    items: [],
    loading: false,
    error: null,
    editingItem: null,
    saveStatus: 'idle'
  },
  reducers: {
    // Add new items to the displayed list
    addItems: (state, action) => {
      state.items = [...state.items, ...action.payload];
    },
    // Set currently edited item
    setEditingItem: (state, action) => {
      state.editingItem = action.payload;
    },
    // Update item in local state
    updateItemLocally: (state, action) => {
      const updatedItem = action.payload;
      const index = state.items.findIndex(item => item.id === updatedItem.id);
      if (index !== -1) state.items[index] = updatedItem;
      
      if (state.allData) {
        const fullIndex = state.allData.findIndex(item => item.id === updatedItem.id);
        if (fullIndex !== -1) state.allData[fullIndex] = updatedItem;
      }
    },
    // Clear error state
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch data cases
      .addCase(fetchData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchData.fulfilled, (state, action) => {
        state.allData = action.payload;
        state.items = action.payload.slice(0, CHUNK_SIZE);
        state.loading = false;
      })
      .addCase(fetchData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save item cases
      .addCase(saveItemToServer.pending, (state) => {
        state.saveStatus = 'loading';
      })
      .addCase(saveItemToServer.fulfilled, (state, action) => {
        const updatedItem = action.payload;
        state.items = state.items.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        );
        state.allData = state.allData.map(item =>
          item.id === updatedItem.id ? updatedItem : item
        );
        state.saveStatus = 'succeeded';
      })
      .addCase(saveItemToServer.rejected, (state, action) => {
        state.saveStatus = 'failed';
        state.error = action.payload;
      });
  }
});

export const { addItems, setEditingItem, updateItemLocally, resetError } = listSlice.actions;
export default listSlice.reducer;