/**
 * @file authService.js
 * @description Authentication API service following the EODSrc/services pattern.
 *
 * Provides named async functions with try/catch error handling & toast notifications,
 * plus default authService export for backward compatibility.
 */

import { toast } from 'react-toastify';
import api from './api.js';
import { AUTH_URLS } from '../constants/urls.js';

export async function loginUser(credentials) {
  try {
    const response = await api.post(AUTH_URLS.LOGIN, credentials);
    toast.success('Login successful!');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function signupUser(signupData) {
  try {
    const response = await api.post(AUTH_URLS.SIGNUP, signupData);
    toast.success('Registration successful! Please login.');
    return response.data;
  } catch (error) {
    toast.error(error.response?.data?.message || error.message);
    throw { status: error.response?.status, message: error.message };
  }
}

export async function logoutUser() {
  try {
    const response = await api.post(AUTH_URLS.LOGOUT);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
