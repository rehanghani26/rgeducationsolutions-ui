import React from 'react';
import { motion } from 'framer-motion';
import { Home, Users, Phone, Plus, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { mockHostel } from '../../data/mockData.js';

const HostelManagement = () => {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <PageHeader
        title="Hostel & Residential Dormitories"
        subtitle="Manage resident blocks, room allocations, warden details, and bed occupancy status"
        breadcrumbs={[{ label: 'Operations' }, { label: 'Hostel' }]}
        actions={<Button icon={<Plus size={16} />}>Allocate Room</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockHostel.map((hst) => (
          <div
            key={hst.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold">
                  <Home size={24} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{hst.blockName}</h3>
                  <p className="text-xs text-slate-400">Total Rooms: {hst.totalRooms} | Occupied: {hst.occupiedRooms}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block">Total Resident Capacity</span>
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">{hst.capacity} Beds</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                <span className="text-slate-400 block">Current Residents</span>
                <span className="text-lg font-extrabold text-indigo-600">{hst.residentsCount} Students</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500">Hostel Warden: <strong className="text-slate-800 dark:text-slate-200">{hst.warden}</strong></span>
              <span className="text-indigo-600 font-semibold flex items-center gap-1"><Phone size={12} /> {hst.wardenPhone}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default HostelManagement;
