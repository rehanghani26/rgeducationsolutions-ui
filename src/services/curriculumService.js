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
    const res = await api.post(BASE_URL, data);
    toast.success(res.data?.message || 'Curriculum & Course assigned successfully!');
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`${BASE_URL}/${id}`, data);
    toast.success(res.data?.message || 'Curriculum updated successfully!');
    return res.data;
  },

  delete: async (id) => {
    const res = await api.delete(`${BASE_URL}/${id}`);
    toast.success(res.data?.message || 'Curriculum course removed successfully!');
    return res.data;
  },

  addUnit: async (id, unitData) => {
    const res = await api.post(`${BASE_URL}/${id}/units`, unitData);
    toast.success('Syllabus unit added successfully!');
    return res.data;
  },

  addMaterial: async (id, materialData) => {
    const res = await api.post(`${BASE_URL}/${id}/materials`, materialData);
    toast.success('Study material added successfully!');
    return res.data;
  },
};

export default curriculumService;
