import { toast } from 'react-toastify';
import api from './api.js';

const BASE_URL = '/erp/curriculum';

export const curriculumService = {
  getAll: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.className) query.append('className', params.className);
      if (params.sectionName) query.append('sectionName', params.sectionName);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await api.get(`${BASE_URL}${qs}`);
      return res.data;
    } catch (err) {
      console.error('curriculumService.getAll error:', err);
      return { success: false, curriculums: [] };
    }
  },

  create: async (data) => {
    try {
      const res = await api.post(BASE_URL, data);
      toast.success(res.data?.message || 'Curriculum & Course assigned successfully!');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to assign curriculum';
      toast.error(msg);
      throw err;
    }
  },

  update: async (id, data) => {
    try {
      const res = await api.put(`${BASE_URL}/${id}`, data);
      toast.success(res.data?.message || 'Curriculum updated successfully!');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update curriculum';
      toast.error(msg);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      const res = await api.delete(`${BASE_URL}/${id}`);
      toast.success(res.data?.message || 'Curriculum course removed successfully!');
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete curriculum';
      toast.error(msg);
      throw err;
    }
  },

  addUnit: async (id, unitData) => {
    try {
      const res = await api.post(`${BASE_URL}/${id}/units`, unitData);
      toast.success('Syllabus unit added successfully!');
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add unit');
      throw err;
    }
  },

  addMaterial: async (id, materialData) => {
    try {
      const res = await api.post(`${BASE_URL}/${id}/materials`, materialData);
      toast.success('Study material added successfully!');
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add material');
      throw err;
    }
  },
};

export default curriculumService;
