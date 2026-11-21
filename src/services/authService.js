/**
 * @file authService.js
 * @description Authentication API service following the EODSrc/services pattern.
 *
 * Uses the shared API client to report request errors,
 * plus default authService export for backward compatibility.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { AUTH_URLS } from '../constants/urls.js';

export async function loginUser(credentials) {
  const response = await api.post(AUTH_URLS.LOGIN, credentials);
  const school = response.data?.school || response.data?.data?.school;
  if (school) {
    const sId = school.schoolId || school.collectionName || school._id;
    if (sId) {
      localStorage.setItem('rges_school_id', sId);
      localStorage.setItem('rges_school_collection', sId);
    }
    localStorage.setItem('rges_school_info', JSON.stringify(school));
  } else if (credentials?.collectionName) {
    localStorage.setItem('rges_school_id', credentials.collectionName.toLowerCase().trim());
    localStorage.setItem('rges_school_collection', credentials.collectionName.toLowerCase().trim());
  }
  toast.success('Login successful!');
  return response.data;
}

export async function signupUser(signupData) {
  const response = await api.post(AUTH_URLS.SIGNUP, signupData);
  toast.success('Registration successful! Please login.');
  return response.data;
}

export async function logoutUser() {
  try {
    const response = await api.post(AUTH_URLS.LOGOUT);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('rges_school_id');
    localStorage.removeItem('rges_school_collection');
    localStorage.removeItem('rges_school_info');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
  }
}

export async function refreshToken() {
  try {
    const response = await api.post(AUTH_URLS.REFRESH, {}, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
}

export async function getMe() {
  try {
    const response = await api.get(AUTH_URLS.ME);
    return response.data;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    throw error;
  }
}

const authService = {
  login: loginUser,
  signup: signupUser,
  logout: logoutUser,
  refresh: refreshToken,
  me: getMe,
};

export default authService;
