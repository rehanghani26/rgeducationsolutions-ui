import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

// Thunks for Students
export const fetchStudents = createAsyncThunk('erp/fetchStudents', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/students');
    return res.data.students;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const registerStudent = createAsyncThunk('erp/registerStudent', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/students', data);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const updateStudent = createAsyncThunk('erp/updateStudent', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/students/${id}`, data);
    return res.data.student;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const resetStudentPassword = createAsyncThunk('erp/resetStudentPassword', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/students/${id}/reset-password`, data);
    return res.data.account;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const removeStudent = createAsyncThunk('erp/removeStudent', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/students/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

// Thunks for Teachers
export const fetchTeachers = createAsyncThunk('erp/fetchTeachers', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/teachers');
    return res.data.teachers;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const registerTeacher = createAsyncThunk('erp/registerTeacher', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/teachers', data);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const updateTeacher = createAsyncThunk('erp/updateTeacher', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/teachers/${id}`, data);
    return res.data.teacher;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const resetTeacherPassword = createAsyncThunk('erp/resetTeacherPassword', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.patch(`/teachers/${id}/reset-password`, data);
    return res.data.account;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

// Thunks for Inventory
export const fetchInventory = createAsyncThunk('erp/fetchInventory', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/inventory');
    return res.data.inventory;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const addInventoryItem = createAsyncThunk('erp/addInventoryItem', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/inventory', data);
    return res.data.item;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const changeStock = createAsyncThunk('erp/changeStock', async (adjustData, { rejectWithValue }) => {
  try {
    const res = await api.post('/inventory/stock-adjust', adjustData);
    return res.data.item;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const fetchVendors = createAsyncThunk('erp/fetchVendors', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/inventory/vendors');
    return res.data.vendors;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

// Thunks for Finance
export const fetchFees = createAsyncThunk('erp/fetchFees', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/finance/fees');
    return res.data.fees;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const recordFeePayment = createAsyncThunk('erp/recordFeePayment', async (payment, { rejectWithValue }) => {
  try {
    const res = await api.post('/finance/fees/collect', payment);
    return res.data.fee;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const fetchExpenses = createAsyncThunk('erp/fetchExpenses', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/finance/expenses');
    return res.data.expenses;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const recordExpense = createAsyncThunk('erp/recordExpense', async (expense, { rejectWithValue }) => {
  try {
    const res = await api.post('/finance/expenses', expense);
    return res.data.expense;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

// Thunks for General Metadata
export const fetchClasses = createAsyncThunk('erp/fetchClasses', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/erp/classes');
    return res.data.classes;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const fetchSections = createAsyncThunk('erp/fetchSections', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/erp/sections');
    return res.data.sections;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

export const fetchSettings = createAsyncThunk('erp/fetchSettings', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/erp/settings');
    return res.data.settings;
  } catch (err) { return rejectWithValue(err.response?.data?.message || err.message); }
});

const erpSlice = createSlice({
  name: 'erp',
  initialState: {
    students: [],
    teachers: [],
    inventory: [],
    vendors: [],
    fees: [],
    expenses: [],
    classes: [],
    sections: [],
    settings: {},
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    // Add pending states
    const setPending = (state) => {
      state.loading = true;
      state.error = null;
    };
    
    // Add rejected states
    const setRejected = (state, action) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // Students
      .addCase(fetchStudents.pending, setPending)
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = action.payload;
      })
      .addCase(fetchStudents.rejected, setRejected)
      .addCase(registerStudent.fulfilled, (state, action) => {
        state.students.push(action.payload.student);
      })
      .addCase(updateStudent.fulfilled, (state, action) => {
        const idx = state.students.findIndex(s => s.id === action.payload.id || s._id === action.payload._id);
        if (idx !== -1) state.students[idx] = action.payload;
      })
      .addCase(removeStudent.fulfilled, (state, action) => {
        state.students = state.students.filter(s => s.id !== action.payload && s._id !== action.payload);
      })
      
      // Teachers
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.teachers = action.payload;
      })
      .addCase(registerTeacher.fulfilled, (state, action) => {
        state.teachers.push(action.payload.teacher);
      })
      .addCase(updateTeacher.fulfilled, (state, action) => {
        const idx = state.teachers.findIndex(t => t.id === action.payload.id || t._id === action.payload._id);
        if (idx !== -1) state.teachers[idx] = action.payload;
      })

      // Inventory
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.inventory = action.payload;
      })
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        state.inventory.push(action.payload);
      })
      .addCase(changeStock.fulfilled, (state, action) => {
        const idx = state.inventory.findIndex(item => item.id === action.payload.id || item._id === action.payload._id);
        if (idx !== -1) state.inventory[idx] = action.payload;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.vendors = action.payload;
      })

      // Finance
      .addCase(fetchFees.fulfilled, (state, action) => {
        state.fees = action.payload;
      })
      .addCase(recordFeePayment.fulfilled, (state, action) => {
        const idx = state.fees.findIndex(f => f.studentId === action.payload.studentId || f.studentId?._id === action.payload.studentId);
        if (idx !== -1) {
          state.fees[idx] = { ...state.fees[idx], ...action.payload };
        } else {
          state.fees.push(action.payload);
        }
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.expenses = action.payload;
      })
      .addCase(recordExpense.fulfilled, (state, action) => {
        state.expenses.unshift(action.payload);
      })

      // General Metadata
      .addCase(fetchClasses.fulfilled, (state, action) => {
        state.classes = action.payload;
      })
      .addCase(fetchSections.fulfilled, (state, action) => {
        state.sections = action.payload;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  }
});

export default erpSlice.reducer;
