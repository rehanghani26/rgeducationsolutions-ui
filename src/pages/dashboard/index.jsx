import React from "react";
import { useSelector } from "react-redux";
import GreetingBanner from "./components/GreetingBanner.jsx";
import AdminDashboard from "./roles/AdminDashboard.jsx";
import TeacherDashboard from "./roles/TeacherDashboard.jsx";
import StudentDashboard from "./roles/StudentDashboard.jsx";
import AccountantDashboard from "./roles/AccountantDashboard.jsx";
import ParentDashboard from "./roles/ParentDashboard.jsx";
import { getUserFromStorage, getUserRole } from "../../config/access.jsx";
import { ROLES } from "../../constants/roles.js";

const Dashboard = () => {
  const authUser = useSelector((state) => state.auth?.user);
  const user = authUser || getUserFromStorage() || { name: "Albus Dumbledore", role: "super-admin" };
  const role = (getUserRole(user) || "").toLowerCase();

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
      case ROLES.SUPER_ADMIN:
      case ROLES.SCHOOL_ADMIN:
      case ROLES.PRINCIPAL:
      case "super-admin":
      case "superadmin":
      case "school-admin":
      case "principal":
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-900 dark:text-slate-100">
      <GreetingBanner user={user} />
      {renderDashboardByRole()}
    </div>
  );
};

export default Dashboard;
