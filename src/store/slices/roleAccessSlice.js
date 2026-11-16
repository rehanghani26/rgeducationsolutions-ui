import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { roleAccessService } from '../../services/roleAccessService.js';
import { setCustomRolePermissions, normalizeRole } from '../../config/access.jsx';

/**
 * Thunk to fetch institutional role permissions matrix once per session.
 * Does not re-fetch if already loaded unless force=true.
 */
export const fetchRolePermissions = createAsyncThunk(
  'roleAccess/fetchRolePermissions',
  async (force = false, { getState, rejectWithValue }) => {
    const state = getState().roleAccess;
    if (!force && state?.isLoaded && state?.roles?.length > 0) {
      return null; // Skip duplicate API call
    }

    try {
      const data = await roleAccessService.getRolePermissions();
      const roles = data?.roles || [];
      if (roles.length > 0) {
        setCustomRolePermissions(roles);
      }
      return {
        roles,
        allModules: data?.allModules || [],
        allButtons: data?.allButtons || [],
      };
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to load role permissions';
      return rejectWithValue(msg);
    }
  }
);

const initialState = {
  roles: [],
  allModules: [],
  allButtons: [],
  isLoaded: false,
  loading: false,
  error: null,
};

export const roleAccessSlice = createSlice({
  name: 'roleAccess',
  initialState,
  reducers: {
    setAllRolePermissions: (state, action) => {
      const { roles, allModules, allButtons } = action.payload || {};
      state.roles = roles || [];
      if (allModules) state.allModules = allModules;
      if (allButtons) state.allButtons = allButtons;
      state.isLoaded = true;
      if (roles) {
        setCustomRolePermissions(roles);
      }
    },
    updateSingleRolePermissions: (state, action) => {
      const { role, config } = action.payload || {};
      const norm = normalizeRole(role);
      const index = state.roles.findIndex((r) => normalizeRole(r.role) === norm);
      if (index >= 0) {
        state.roles[index] = { ...state.roles[index], ...config, isCustomized: true };
      } else {
        state.roles.push({ role: norm, ...config, isCustomized: true });
      }
      setCustomRolePermissions(state.roles);
    },
    clearRoleAccess: (state) => {
      state.roles = [];
      state.allModules = [];
      state.allButtons = [];
      state.isLoaded = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolePermissions.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.roles = action.payload.roles;
          state.allModules = action.payload.allModules;
          state.allButtons = action.payload.allButtons;
          state.isLoaded = true;
        }
      })
      .addCase(fetchRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase('auth/logoutUser/fulfilled', (state) => {
        state.roles = [];
        state.allModules = [];
        state.allButtons = [];
        state.isLoaded = false;
        state.loading = false;
        state.error = null;
      });
  },
});

export const {
  setAllRolePermissions,
  updateSingleRolePermissions,
  clearRoleAccess,
} = roleAccessSlice.actions;

export default roleAccessSlice.reducer;
