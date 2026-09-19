/**
 * @file AppRoutes.jsx
 * @description Declarative React Router definitions mapping over appRoutes array.
 * Mirrors the EODSrc/routes/index.jsx architectural pattern.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES } from './routes.js';
import appRoutes from './appRoutes.js';
import { ROLES } from '../constants/roles.js';
import { hasModuleAccess } from '../config/access.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';

/** Redirects unauthenticated users to /login */
const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />;
};

/** Restricts access to users whose role is in allowedRoles or has module access */
const RoleGuard = ({ children, allowedRoles, module }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!allowedRoles && !module) return children;
  const rawRole = (user.role || '').toLowerCase();
  const userRole = rawRole.replace(/_/g, '-');
  if (userRole === ROLES.SUPER_ADMIN || userRole === 'superadmin') return children;
  if (module && hasModuleAccess(user, module)) return children;
  const allowed = allowedRoles && allowedRoles.map((r) => (r || '').toLowerCase().replace(/_/g, '-'));
  return allowed && (allowed.includes(userRole) || allowed.includes(rawRole))
    ? children
    : <Navigate to={ROUTES.DASHBOARD} replace />;
};

const AppRoutes = () => {
  const publicRoutes = appRoutes.filter((r) => r.public);
  const fullScreenRoutes = appRoutes.filter((r) => !r.public && r.fullScreen);
  const protectedRoutes = appRoutes.filter((r) => !r.public && !r.fullScreen);

  return (
    <Routes>
      {/* ── Public Routes (Login, Signup) ─────────────────────────────────── */}
      {publicRoutes.map((route, idx) => {
        const Component = route.element;
        return <Route key={idx} path={route.path} element={<Component />} />;
      })}

      {/* ── Full-Screen Protected Routes (AI Mode) ────────────────────────── */}
      {fullScreenRoutes.map((route, idx) => {
        const Component = route.element;
        return (
          <Route
            key={`fs-${idx}`}
            path={route.path}
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={route.allowedRoles} module={route.module}>
                  <Component />
                </RoleGuard>
              </AuthGuard>
            }
          />
        );
      })}

      {/* ── Protected App Shell (DashboardLayout) ─────────────────────────── */}
      <Route
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        {protectedRoutes.map((route, idx) => {
          const Component = route.element;
          return (
            <Route
              key={idx}
              path={route.path}
              element={
                <RoleGuard allowedRoles={route.allowedRoles} module={route.module}>
                  <Component />
                </RoleGuard>
              }
            />
          );
        })}
      </Route>

      {/* ── Catch-all Fallback Redirect ───────────────────────────────────── */}
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};

export default AppRoutes;
