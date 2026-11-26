import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, X, Building2, Mail, Phone, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Badge, Input, Modal, EmptyState } from '../components/ui';
import { leadsAPI } from '../lib/api';
import { demoLeads } from '../lib/demoData';
import { Lead } from '../types';
import { formatTimeAgo, getSentimentEmoji } from '../lib/utils';

export const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>(demoLeads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    industry: 'Technology',
    budget: '',
    requirements: '',
    purchaseTimeline: 'Within 30 days',
    status: 'new',
  });

  const loadLeads = async () => {
    try {
      const res = await leadsAPI.getAll({ search, status: statusFilter });
      if (res.data?.leads) setLeads(res.data.leads);
    } catch {
      // keep current state
    }
  };

  useEffect(() => {
    loadLeads();
  }, [statusFilter]);

  const filtered = leads.filter((l) => {
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      l.name.toLowerCase().includes(q) ||
      (l.email || '').toLowerCase().includes(q) ||
      (l.company || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const openCreate = () => {
    setEditingLead(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      industry: 'Technology',
      budget: '',
      requirements: '',
      purchaseTimeline: 'Within 30 days',
      status: 'new',
    });
    setIsModalOpen(true);
  };

  const openEdit = (lead: Lead) => {
    setEditingLead(lead);
    setForm({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      industry: lead.industry || 'Technology',
      budget: lead.budget || '',
      requirements: lead.requirements || '',
      purchaseTimeline: lead.purchaseTimeline || 'Within 30 days',
      status: lead.status,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');

    try {
      if (editingLead) {
        const res = await leadsAPI.update(editingLead._id, form);
        const updated = res.data?.lead || { ...editingLead, ...form };
        setLeads((prev) => prev.map((l) => (l._id === editingLead._id ? updated : l)));
        toast.success('Lead updated');
      } else {
        const res = await leadsAPI.create(form);
        const created = res.data?.lead;
        if (created) setLeads((prev) => [created, ...prev]);
        toast.success('Lead created');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Failed to save lead');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await leadsAPI.delete(id);
      setLeads((prev) => prev.filter((l) => l._id !== id));
      if (selectedLead?._id === id) setSelectedLead(null);
      toast.success('Lead deleted');
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const statusBadgeVariant = (s: string) => {
    switch (s) {
      case 'qualified':
      case 'converted':
        return 'success';
      case 'proposal':
        return 'secondary';
      case 'contacted':
        return 'primary';
      case 'lost':
        return 'error';
      default:
        return 'default';
    }
  };

  const avgScore = leads.length
    ? Math.round(leads.reduce((s, l) => s + (l.leadScore || 0), 0) / leads.length)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-space text-2xl font-bold tracking-tight">Leads & CRM</h2>
          <p className="text-sm text-gray-400">Manage AI-qualified prospects and pipeline stages.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="p-4">
          <p className="text-xs text-gray-400">Total Leads</p>
          <p className="font-space text-2xl font-bold mt-1 tabular-nums">{leads.length}</p>
        </Card>
        <Card hover className="p-4">
          <p className="text-xs text-gray-400">Qualified</p>
          <p className="font-space text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
            {leads.filter((l) => l.status === 'qualified' || l.status === 'proposal').length}
          </p>
        </Card>
        <Card hover className="p-4">
          <p className="text-xs text-gray-400">Converted</p>
          <p className="font-space text-2xl font-bold text-secondary mt-1 tabular-nums">
            {leads.filter((l) => l.status === 'converted').length}
          </p>
        </Card>
        <Card hover className="p-4">
          <p className="text-xs text-gray-400">Average Score</p>
          <p className="font-space text-2xl font-bold text-primary mt-1 tabular-nums">{avgScore}/100</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-bg-secondary border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-secondary/60"
        >
          <option value="all" className="bg-bg-card">All Statuses</option>
          <option value="new" className="bg-bg-card">New</option>
          <option value="contacted" className="bg-bg-card">Contacted</option>
          <option value="qualified" className="bg-bg-card">Qualified</option>
          <option value="proposal" className="bg-bg-card">Proposal</option>
          <option value="converted" className="bg-bg-card">Converted</option>
          <option value="lost" className="bg-bg-card">Lost</option>
        </select>
      </div>

      {/* Table or Empty State */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No matching leads"
          description="Try clearing your search or status filter, or add a new lead manually."
          action={<Button onClick={openCreate}>Add Lead</Button>}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.025] border-b border-white/[0.07] text-[11px] text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Lead</th>
                  <th className="px-5 py-3.5">Company</th>
                  <th className="px-5 py-3.5">Score</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Sentiment</th>
                  <th className="px-5 py-3.5">Last Contact</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filtered.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-white/[0.03] cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{lead.name}</p>
                      <p className="text-xs text-gray-400">{lead.email}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-300">{lead.company || '—'}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary"
                            style={{ width: `${lead.leadScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium tabular-nums">{lead.leadScore}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={statusBadgeVariant(lead.status)}>{lead.status}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <span>{getSentimentEmoji(lead.sentiment)}</span>{' '}
                      <span className="text-xs text-gray-400 capitalize">{lead.sentiment}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">
                      {lead.lastInteraction ? formatTimeAgo(lead.lastInteraction) : 'New'}
                    </td>
                    <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => openEdit(lead)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                          aria-label="Edit lead"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-error hover:bg-error/10 transition-colors"
                          aria-label="Delete lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Lead Detail Drawer */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-md bg-bg-secondary/95 backdrop-blur-2xl border-l border-white/10 h-full p-6 overflow-y-auto z-10"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-space text-xl font-bold">{selectedLead.name}</h3>
                <button onClick={() => setSelectedLead(null)} className="p-1.5 rounded-lg hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-5">
                <div className="flex items-center justify-between">
                  <Badge variant={statusBadgeVariant(selectedLead.status)}>{selectedLead.status}</Badge>
                  <span className="font-space text-lg font-bold text-secondary tabular-nums">
                    Score: {selectedLead.leadScore}/100
                  </span>
                </div>

                <div className="space-y-2.5 text-sm text-gray-300">
                  {selectedLead.company && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" /> {selectedLead.company}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" /> {selectedLead.email}
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" /> {selectedLead.phone}
                    </div>
                  )}
                </div>

                <Card className="p-4 space-y-2 text-sm">
                  <p className="text-xs text-gray-400 font-medium">Qualification Details</p>
                  <p><span className="text-gray-400">Budget:</span> {selectedLead.budget || 'Not specified'}</p>
                  <p><span className="text-gray-400">Timeline:</span> {selectedLead.purchaseTimeline || 'Not specified'}</p>
                  <p><span className="text-gray-400">Requirements:</span> {selectedLead.requirements || '—'}</p>
                </Card>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={() => openEdit(selectedLead)}>
                    Edit Lead
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(selectedLead._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLead ? 'Edit Lead' : 'Add New Lead'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
            <Input
              label="Budget"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white"
            >
              <option value="new" className="bg-bg-card text-white">New</option>
              <option value="contacted" className="bg-bg-card text-white">Contacted</option>
              <option value="qualified" className="bg-bg-card text-white">Qualified</option>
              <option value="proposal" className="bg-bg-card text-white">Proposal</option>
              <option value="converted" className="bg-bg-card text-white">Converted</option>
              <option value="lost" className="bg-bg-card text-white">Lost</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Requirements</label>
            <textarea
              rows={3}
              value={form.requirements}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
              className="w-full bg-bg-secondary border border-white/10 rounded-xl p-3 text-sm text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingLead ? 'Save Changes' : 'Create Lead'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
