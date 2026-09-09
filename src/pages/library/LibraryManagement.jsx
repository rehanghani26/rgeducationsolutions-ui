import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Plus, Bookmark, RefreshCw, Filter, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import { mockLibrary } from '../../data/mockData.js';

const LibraryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = mockLibrary.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <PageHeader
        title="Library Management & Book Catalog"
        subtitle="Catalog Islamic books, academic textbooks, track borrowing history and rack positions"
        breadcrumbs={[{ label: 'Resources' }, { label: 'Library' }]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" icon={<Bookmark size={16} />}>Issue Book</Button>
            <Button icon={<Plus size={16} />}>Add New Book</Button>
          </div>
        }
      />

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Title, Author, ISBN or Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Book Catalog Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">ISBN</th>
                <th className="p-3">Book Title</th>
                <th className="p-3">Author</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-center">Rack Position</th>
                <th className="p-3 text-center">Total Copies</th>
                <th className="p-3 text-center">Available</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredBooks.map((bk) => (
                <tr key={bk.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 text-slate-400 text-xs font-mono">{bk.isbn}</td>
                  <td className="p-3 font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-500" />
                    {bk.title}
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{bk.author}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {bk.category}
                    </span>
                  </td>
                  <td className="p-3 text-center text-xs font-bold text-slate-500">{bk.rack}</td>
                  <td className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">{bk.totalCopies}</td>
                  <td className="p-3 text-center font-extrabold text-emerald-600">{bk.availableCopies}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      In Stock
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default LibraryManagement;
