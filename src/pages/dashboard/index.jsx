import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useOutletContext } from "react-router-dom";
import GreetingBanner from "./components/GreetingBanner.jsx";
import DashboardTabBar from "./components/DashboardTabBar.jsx";
import AdminDashboard from "./roles/AdminDashboard.jsx";
import TeacherDashboard from "./roles/TeacherDashboard.jsx";
import StudentDashboard from "./roles/StudentDashboard.jsx";
import AccountantDashboard from "./roles/AccountantDashboard.jsx";
import ParentDashboard from "./roles/ParentDashboard.jsx";
import StaffDashboard from "./roles/StaffDashboard.jsx";
import { getUserFromStorage, getUserRole } from "../../config/access.jsx";
import { ROLES, ADMIN_ROLES } from "../../constants/roles.js";

const Dashboard = () => {
  const authUser = useSelector((state) => state.auth?.user);
  const user =
    authUser ||
    getUserFromStorage() || { name: "Albus Dumbledore", role: "super-admin" };
  const role = (getUserRole(user) || "").toLowerCase();

  const outletContext = useOutletContext();
  const [localTab, setLocalTab] = useState("home");
  const activeTab = outletContext?.activeDashboardTab || localTab;
  const setActiveTab = outletContext?.setActiveDashboardTab || setLocalTab;

  const isAdminRole =
    role === ROLES.SUPER_ADMIN ||
    role === "superadmin" ||
    role === "super-admin" ||
    role === ROLES.SCHOOL_ADMIN ||
    role === "school-admin" ||
    role === ROLES.PRINCIPAL ||
    role === "principal" ||
    role === "admin" ||
    ADMIN_ROLES.includes(role);

  const renderDashboardByRole = () => {
    switch (role) {
      case ROLES.STUDENT:
      case "student":
        return <StudentDashboard />;
      case ROLES.PARENT:
      case "parent":
        return <ParentDashboard />;
      case ROLES.TEACHER:
      case ROLES.HEAD_TEACHER:
      case ROLES.HOD:
      case ROLES.COORDINATOR:
      case "teacher":
      case "tg":
        return <TeacherDashboard />;
      case ROLES.ACCOUNTANT:
      case "accountant":
        return <AccountantDashboard />;
      case ROLES.LIBRARIAN:
      case "librarian":
      case ROLES.PEON:
      case "peon":
      case "staff":
      case "support":
        return <StaffDashboard />;
      case ROLES.SUPER_ADMIN:
      case ROLES.SCHOOL_ADMIN:
      case ROLES.PRINCIPAL:
      case "super-admin":
      case "superadmin":
      case "school-admin":
      case "principal":
      default:
        return <AdminDashboard activeTab={activeTab} />;
    }
  };

  return (
    <div className="space-y-5 pb-12 font-sans text-slate-900 dark:text-slate-100">
      {/* 1. Welcome Card */}
      <GreetingBanner user={user} />

      {/* 2. Dashboard Navigation Tabs — rendered directly below Welcome Card */}
      {isAdminRole && (
        <DashboardTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {/* 3. Role-based Dashboard Content */}
      {renderDashboardByRole()}
    </div>
  );
};

export default Dashboard;
