import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser, clearError } from '../store/slices/authSlice.js';
import {
  Lock, Mail, Loader2, User, School, Phone, Calendar,
  MapPin, Building, Globe, ArrowRight, ArrowLeft, ShieldAlert, Award
} from 'lucide-react';
import rgLogo from '../assets/logo/RGLOGO.png';

const Signup = () => {
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  
  // Step 1: Personal details
  const [personal, setPersonal] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Step 2: School details
  const [school, setSchool] = useState({
    schoolName: '',
    schoolCode: '',
    schoolType: 'secondary',
    establishedYear: new Date().getFullYear().toString(),
    academicYear: '2026-2027',
    contactEmail: '',
    schoolPhone: '',
    alternatePhone: '',
    websiteUrl: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    schoolMotto: '',
    principalName: ''
  });

  const [localErrors, setLocalErrors] = useState({});

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonal(prev => ({ ...prev, [name]: value }));
    if (localErrors[name]) {
      setLocalErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSchoolChange = (e) => {
    const { name, value } = e.target;
    setSchool(prev => ({ ...prev, [name]: value }));
    if (localErrors[name]) {
      setLocalErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateStep1 = () => {
    const errors = {};
    if (!personal.name.trim()) errors.name = 'Full name is required';
    if (!personal.username.trim()) errors.username = 'Username is required';
    if (!personal.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(personal.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!personal.password) {
      errors.password = 'Password is required';
    } else if (personal.password.length < 5) {
      errors.password = 'Password must be at least 5 characters';
    }
    if (personal.password !== personal.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!school.schoolName.trim()) errors.schoolName = 'School/Company name is required';
    if (!school.addressLine1.trim()) errors.addressLine1 = 'Address is required';
    if (!school.city.trim()) errors.city = 'City is required';
    if (!school.state.trim()) errors.state = 'State is required';
    if (!school.country.trim()) errors.country = 'Country is required';
    if (!school.postalCode.trim()) errors.postalCode = 'Postal code is required';
    
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    dispatch(clearError());
    if (validateStep1()) {
      setStep(2);
      // Pre-fill school contact email with personal email if empty
      if (!school.contactEmail) {
        setSchool(prev => ({ ...prev, contactEmail: personal.email }));
      }
    }
  };

  const handleBack = () => {
    setStep(1);
    setLocalErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    
    dispatch(clearError());
    
    // Combine state payloads
    const payload = {
      ...personal,
      ...school
    };

    const result = await dispatch(signupUser(payload));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans px-4 py-12"
    >
      <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl transition-all duration-300">
        
        {/* Branding & Header */}
        <div className="text-center mb-8">
          <img
            src={rgLogo}
            alt="RG EduCore Logo"
            style={{ mixBlendMode: 'screen' }}
            className="inline-block w-24 h-24 object-contain mb-4"
          />
          <h2 className="text-3xl font-extrabold text-white tracking-tight">RG EduCore</h2>
          <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold">
            Super Admin Registration
          </p>
        </div>

        {/* Progress Bar / Steps indicator */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            step === 1 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/30' 
              : 'bg-indigo-950 text-indigo-400 border border-indigo-900'
          }`}>
            <User size={14} />
            <span>1. Account Credentials</span>
          </div>
          
          <div className="h-[1px] w-8 bg-slate-800" />

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            step === 2 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/30' 
              : 'bg-indigo-950/40 text-slate-500 border border-slate-800/60'
          }`}>
            <School size={14} />
            <span>2. School Details</span>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-400 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: Account credentials */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    Super Admin Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Albus Dumbledore"
                      value={personal.name}
                      onChange={handlePersonalChange}
                      className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                    />
                  </div>
                  {localErrors.name && (
                    <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.name}</p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    Username *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                    <input
                      type="text"
                      name="username"
                      placeholder="e.g. superadmin"
                      value={personal.username}
                      onChange={handlePersonalChange}
                      className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                    />
                  </div>
                  {localErrors.username && (
                    <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.username}</p>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. admin@school.com"
                    value={personal.email}
                    onChange={handlePersonalChange}
                    className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                  />
                </div>
                {localErrors.email && (
                  <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                    <input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={personal.password}
                      onChange={handlePersonalChange}
                      className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                    />
                  </div>
                  {localErrors.password && (
                    <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={personal.confirmPassword}
                      onChange={handlePersonalChange}
                      className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                    />
                  </div>
                  {localErrors.confirmPassword && (
                    <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={handleNext}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm focus:outline-none flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition duration-200"
              >
                <span>Continue to School Profile</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: School / organization details */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* School Name */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    School / Company Name *
                  </label>
                  <div className="relative">
                    <School className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                    <input
                      type="text"
                      name="schoolName"
                      placeholder="e.g. Hogwarts Academy"
                      value={school.schoolName}
                      onChange={handleSchoolChange}
                      className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                    />
                  </div>
                  {localErrors.schoolName && (
                    <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.schoolName}</p>
                  )}
                </div>

                {/* School Code */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    School Code / Identifier
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                    <input
                      type="text"
                      name="schoolCode"
                      placeholder="e.g. HOG-001"
                      value={school.schoolCode}
                      onChange={handleSchoolChange}
                      className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* School Type */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    Institution Type
                  </label>
                  <select
                    name="schoolType"
                    value={school.schoolType}
                    onChange={handleSchoolChange}
                    className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 px-3.5 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 select-custom"
                  >
                    <option value="primary" className="bg-slate-900">Primary School</option>
                    <option value="secondary" className="bg-slate-900">Secondary School</option>
                    <option value="senior" className="bg-slate-900">Senior Secondary</option>
                    <option value="college" className="bg-slate-900">College</option>
                    <option value="university" className="bg-slate-900">University</option>
                  </select>
                </div>

                {/* Established Year */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    Established Year
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                    <input
                      type="number"
                      name="establishedYear"
                      placeholder="e.g. 2026"
                      value={school.establishedYear}
                      onChange={handleSchoolChange}
                      className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                    />
                  </div>
                </div>

                {/* Academic Year */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    Active Session
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                    <input
                      type="text"
                      name="academicYear"
                      placeholder="e.g. 2026-2027"
                      value={school.academicYear}
                      onChange={handleSchoolChange}
                      className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* School Phone */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    School Phone *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                    <input
                      type="tel"
                      name="schoolPhone"
                      placeholder="e.g. +1 555-0199"
                      value={school.schoolPhone}
                      onChange={handleSchoolChange}
                      className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                    />
                  </div>
                </div>

                {/* Website URL */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    Website URL
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                    <input
                      type="url"
                      name="websiteUrl"
                      placeholder="e.g. https://hogwarts.edu"
                      value={school.websiteUrl}
                      onChange={handleSchoolChange}
                      className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-2">
                  Address Line 1 *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                  <input
                    type="text"
                    name="addressLine1"
                    placeholder="e.g. 4 Privet Drive"
                    value={school.addressLine1}
                    onChange={handleSchoolChange}
                    className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                  />
                </div>
                {localErrors.addressLine1 && (
                  <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.addressLine1}</p>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* City */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="London"
                    value={school.city}
                    onChange={handleSchoolChange}
                    className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                  />
                  {localErrors.city && (
                    <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.city}</p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Surrey"
                    value={school.state}
                    onChange={handleSchoolChange}
                    className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                  />
                  {localErrors.state && (
                    <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.state}</p>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    placeholder="UK"
                    value={school.country}
                    onChange={handleSchoolChange}
                    className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                  />
                  {localErrors.country && (
                    <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.country}</p>
                  )}
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-slate-300 text-xs font-semibold mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="HP1 1AA"
                    value={school.postalCode}
                    onChange={handleSchoolChange}
                    className="w-full bg-slate-950/40 border border-slate-700/60 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                  />
                  {localErrors.postalCode && (
                    <p className="text-red-400 text-[10px] mt-1 font-semibold">{localErrors.postalCode}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold py-3.5 px-4 rounded-xl text-sm focus:outline-none flex items-center justify-center gap-2 transition duration-200"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm focus:outline-none flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition duration-200"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </form>

        {/* Back to Login Footer */}
        <div className="mt-8 border-t border-slate-800 pt-6 text-center">
          <p className="text-slate-500 text-xs font-semibold">
            Already registered?{' '}
            <Link to="/login" className="text-indigo-400 hover:underline font-bold">
              Sign In to School Portal
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Signup;
