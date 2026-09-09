import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import HomeTab from "../tabs/HomeTab.jsx";
import NoticeBoardTab from "../tabs/NoticeBoardTab.jsx";
import StudentsTab from "../tabs/StudentsTab.jsx";
import StaffTab from "../tabs/StaffTab.jsx";
import FinanceTab from "../tabs/FinanceTab.jsx";

const AdminDashboard = () => {
  const outletContext = useOutletContext();
  const [localTab, setLocalTab] = useState("home");
  const activeTab = outletContext?.activeDashboardTab || localTab;

  return (
    <div className="space-y-6 font-sans text-slate-900 dark:text-slate-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {activeTab === "home" && <HomeTab />}
          {activeTab === "notices" && <NoticeBoardTab />}
          {activeTab === "students" && <StudentsTab />}
          {activeTab === "staff" && <StaffTab />}
          {activeTab === "finance" && <FinanceTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
