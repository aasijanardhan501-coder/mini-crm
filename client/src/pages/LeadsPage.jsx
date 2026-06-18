import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import { formatCurrency, formatDate } from '../utils/helpers';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import Modal from '../components/common/Modal';
import LeadFilters from '../components/leads/LeadFilters';
import LeadForm from '../components/leads/LeadForm';
import {
  Plus,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FilterX,
  AlertTriangle,
} from 'lucide-react';

const LeadsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Query state parameters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Leads payload states
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal control states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch leads when query settings or page indices shift
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        sortBy,
        order,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (status) params.status = status;
      if (source) params.source = source;

      const response = await api.get('/leads', { params });
      if (response.data.success) {
        setLeads(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load leads:', error);
      showToast('Error fetching lead records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [debouncedSearch, status, source, sortBy, order, page]);

  // Reset pagination index if search parameters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, source]);

  // Lead CRUD handlers
  const handleOpenAddModal = () => {
    setEditingLead(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (lead, e) => {
    e.stopPropagation(); // Stop navigation redirect triggers
    setEditingLead(lead);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteModal = (lead, e) => {
    e.stopPropagation();
    setLeadToDelete(lead);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setSubmitLoading(true);
      let response;
      
      if (editingLead) {
        // Edit lead PUT call
        response = await api.put(`/leads/${editingLead._id}`, formData);
      } else {
        // Create lead POST call
        response = await api.post('/leads', formData);
      }

      if (response.data.success) {
        showToast(
          editingLead ? 'Lead updated successfully' : 'Lead created successfully',
          'success'
        );
        setIsFormModalOpen(false);
        setEditingLead(null);
        fetchLeads();
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Action failed.';
      showToast(msg, 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setSubmitLoading(true);
      const response = await api.delete(`/leads/${leadToDelete._id}`);
      if (response.data.success) {
        showToast(`Lead '${leadToDelete.name}' deleted successfully`, 'success');
        setIsDeleteModalOpen(false);
        setLeadToDelete(null);
        fetchLeads();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setSource('');
    setSortBy('createdAt');
    setOrder('desc');
    setPage(1);
  };

  // Helper flags
  const isViewer = user?.role === 'viewer';
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Page Header Header info & plus button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Leads Pipeline
          </h2>
          <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
            Search, edit, and track customer lead interactions
          </p>
        </div>

        {!isViewer && (
          <Button
            onClick={handleOpenAddModal}
            icon={<Plus className="w-4 h-4" />}
            className="shadow-md shadow-brand-500/10 w-full sm:w-auto"
          >
            Add New Lead
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <LeadFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        source={source}
        setSource={setSource}
        sortBy={sortBy}
        setSortBy={setSortBy}
        order={order}
        setOrder={setOrder}
      />

      {/* Main Table view */}
      <Card className="overflow-hidden flex flex-col p-0 border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-55/40 dark:bg-slate-800/10 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase border-b border-slate-100 dark:border-slate-800">
                <th className="py-4 px-6">Lead Name</th>
                <th className="py-4 px-6">Email / Phone</th>
                <th className="py-4 px-6">Company</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Source</th>
                <th className="py-4 px-6">Value</th>
                <th className="py-4 px-6">Assigned To</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
              {loading ? (
                // Skeletons while loading
                Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <tr key={i}>
                      <td className="py-4 px-6"><Skeleton variant="text" width="70%" /></td>
                      <td className="py-4 px-6"><Skeleton variant="text" width="60%" /></td>
                      <td className="py-4 px-6"><Skeleton variant="text" width="50%" /></td>
                      <td className="py-4 px-6"><Skeleton variant="text" width="40%" /></td>
                      <td className="py-4 px-6"><Skeleton variant="text" width="40%" /></td>
                      <td className="py-4 px-6"><Skeleton variant="text" width="30%" /></td>
                      <td className="py-4 px-6"><Skeleton variant="text" width="50%" /></td>
                      <td className="py-4 px-6 text-right"><Skeleton variant="text" width="40%" className="ml-auto" /></td>
                    </tr>
                  ))
              ) : leads.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan="8" className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FilterX className="w-12 h-12 stroke-1" />
                      <p className="text-sm font-semibold">No lead records match your search criteria.</p>
                      <button
                        onClick={handleClearFilters}
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                // Loaded rows
                leads.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    className="hover:bg-slate-55/30 dark:hover:bg-slate-850/10 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-850 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 text-sm">
                        {lead.name}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        Created {formatDate(lead.createdAt)}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <p className="text-slate-650 dark:text-slate-300 font-medium">{lead.email}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{lead.phone || '—'}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-650 dark:text-slate-300 font-medium">
                      {lead.company || '—'}
                    </td>
                    <td className="py-4 px-6">
                      <Badge text={lead.status} type={lead.status} />
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-450 font-semibold uppercase tracking-wider">
                      {lead.source}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {formatCurrency(lead.value)}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {lead.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Eye details button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leads/${lead._id}`);
                          }}
                          className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Edit button (Admin/Manager only) */}
                        {!isViewer && (
                          <button
                            onClick={(e) => handleOpenEditModal(lead, e)}
                            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-colors"
                            title="Edit Details"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}

                        {/* Delete button (Admin only) */}
                        {isAdmin && (
                          <button
                            onClick={(e) => handleOpenDeleteModal(lead, e)}
                            className="p-1.5 rounded-lg border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar controls */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Page {pagination.page} of {pagination.pages} (Total {pagination.total} leads)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                icon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(p + 1, pagination.pages))}
                disabled={page === pagination.pages}
                icon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 3. Add/Edit Lead Modal */}
      <Modal
        isOpen={isFormModalOpen}
        title={editingLead ? 'Modify Lead Details' : 'Register New Lead'}
        onClose={() => setIsFormModalOpen(false)}
      >
        <LeadForm
          initialData={editingLead}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormModalOpen(false)}
          submitLoading={submitLoading}
        />
      </Modal>

      {/* 4. Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="Delete Lead Record"
        onClose={() => setIsDeleteModalOpen(false)}
      >
        <div className="space-y-4 animate-slide-in">
          <div className="flex gap-3 items-start p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-250">
            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Warning: This action is permanent.</p>
              <p className="text-xs mt-1 leading-normal">
                Deleting this lead will wipe all notes and details from the database. This action cannot be undone.
              </p>
            </div>
          </div>

          <p className="text-sm font-medium text-slate-600 dark:text-slate-350">
            Are you sure you want to delete <span className="font-semibold text-slate-800 dark:text-slate-100">"{leadToDelete?.name}"</span>?
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} loading={submitLoading}>
              Delete Lead
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default LeadsPage;
