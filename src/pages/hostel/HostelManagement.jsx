import React from 'react';
import { motion } from 'framer-motion';
import { Home, Users, Phone, Plus, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { mockHostel } from '../../data/mockData.js';

const HostelManagement = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pb-8">
      <PageHeader
        title="Hostel & Residential Dormitories"
        subtitle="Manage resident blocks, room allocations, warden details, and bed occupancy status"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Hostel' }]}
        actions={<Button icon={<Plus size={16} />}>Allocate Room</Button>}
      />

      {mockHostel && mockHostel.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
          {mockHostel.map((hst) => (
            <div
              key={hst.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3 sm:space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">
                    <Home size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">{hst.blockName}</h3>
                    <p className="text-xs text-slate-400">Total Rooms: {hst.totalRooms} | Occupied: {hst.occupiedRooms}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block">Total Resident Capacity</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{hst.capacity} Beds</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 block">Current Residents</span>
                  <span className="text-base sm:text-lg font-bold text-indigo-600">{hst.residentsCount} Students</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">Hostel Warden: <strong className="text-slate-800 dark:text-slate-200">{hst.warden}</strong></span>
                <span className="text-indigo-600 font-semibold flex items-center gap-1"><Phone size={12} /> {hst.wardenPhone}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Home size={40} className="mx-auto mb-3 opacity-40 text-slate-400" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No hostel dormitory records found (N/A)</p>
          <p className="text-xs text-slate-400 mt-1">Hostel blocks and residential allocations will appear here once configured.</p>
        </div>
      )}
    </motion.div>
  );
};

export default HostelManagement;
