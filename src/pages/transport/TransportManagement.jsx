import React from 'react';
import { motion } from 'framer-motion';
import { Bus, MapPin, Phone, Users, Plus, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { mockTransport } from '../../data/mockData.js';

const TransportManagement = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <PageHeader
        title="School Transport & Vehicle Routes"
        subtitle="Manage fleet vehicles, driver contacts, pickup routes, and student seating allocations"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Transport' }]}
        actions={<Button icon={<Plus size={16} />}>Add Bus Route</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockTransport.map((tr) => (
          <div
            key={tr.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
                <Bus size={22} />
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                {tr.status}
              </span>
            </div>

            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{tr.routeName}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Vehicle Reg: {tr.vehicleNo}</p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-50 dark:border-slate-800/50">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Driver Name:</span>
                <span className="font-bold">{tr.driverName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Driver Phone:</span>
                <span className="font-bold text-indigo-600 flex items-center gap-1">
                  <Phone size={12} /> {tr.driverPhone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Bus Seating Capacity:</span>
                <span className="font-bold">{tr.capacity} Seats</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Enrolled Students:</span>
                <span className="font-extrabold text-emerald-600">{tr.assignedStudents} Students</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TransportManagement;
