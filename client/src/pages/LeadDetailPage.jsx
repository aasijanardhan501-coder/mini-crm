import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate, getRelativeTime } from '../utils/helpers';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import Modal from '../components/common/Modal';
import LeadForm from '../components/leads/LeadForm';
import {
  ChevronLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Plus,
  MessageSquare,
  Edit3,
} from 'lucide-react';

const LeadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Modal edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const [leadRes, activityRes] = await Promise.all([
        api.get(`/leads/${id}`),
        api.get(`/analytics/recent-activity?leadId=${id}`),
      ]);

      if (leadRes.data.success) setLead(leadRes.data.data);
      if (activityRes.data.success) setActivities(activityRes.data.data);
    } catch (error) {
      console.error('Failed to load lead details:', error);
      showToast('Error loading lead records', 'error');
      navigate('/leads'); // Redirect on failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      setStatusLoading(true);
      const response = await api.patch(`/leads/${id}/status`, { status: newStatus });
      if (response.data.success) {
        setLead(response.data.data);
        showToast('Lead status updated successfully', 'success');
        // Refresh activity log
        const activityRes = await api.get(`/analytics/recent-activity?leadId=${id}`);
        if (activityRes.data.success) setActivities(activityRes.data.data);
      }
    } catch (error) {
      showToast('Failed to update lead status', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      setNoteLoading(true);
      const response = await api.post(`/leads/${id}/notes`, { content: noteContent });
      if (response.data.success) {
        setLead(response.data.data);
        setNoteContent('');
        showToast('Note added successfully', 'success');
        
        // Refresh activity log
        const activityRes = await api.get(`/analytics/recent-activity?leadId=${id}`);
        if (activityRes.data.success) setActivities(activityRes.data.data);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add note', 'error');
    } finally {
      setNoteLoading(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      setSubmitLoading(true);
      const response = await api.put(`/leads/${id}`, formData);
      if (response.data.success) {
        setLead(response.data.data);
        showToast('Lead details updated successfully', 'success');
        setIsEditModalOpen(false);
        
        // Refresh activity log
        const activityRes = await api.get(`/analytics/recent-activity?leadId=${id}`);
        if (activityRes.data.success) setActivities(activityRes.data.data);
      }
    } catch (error) {
      showToast('Update failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const isViewer = user?.role === 'viewer';

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" width="10%" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-4">
            <Skeleton variant="title" />
            <Skeleton variant="text" />
            <Skeleton variant="rect" height="200px" />
          </Card>
          <Card className="space-y-4">
            <Skeleton variant="title" />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </Card>
        </div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Back to Leads header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" /> Back to Leads
        </button>

        {!isViewer && (
          <Button
            onClick={() => setIsEditModalOpen(true)}
            variant="outline"
            icon={<Edit3 className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Edit Details
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Details and Notes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Lead Summary Info Card */}
          <Card>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                  {lead.name}
                </h2>
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500 mt-1">
                  Registered {formatDate(lead.createdAt)}
                </p>
              </div>

              {/* Inline status update */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">
                  Status:
                </span>
                <select
                  value={lead.status}
                  onChange={handleStatusChange}
                  disabled={isViewer || statusLoading}
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-150 outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal sent">Proposal Sent</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
            </div>

            {/* Core Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-55 dark:border-slate-800/40">
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Email</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{lead.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Phone</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{lead.phone || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Company</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{lead.company || '—'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Deal Value</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{formatCurrency(lead.value)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Source</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate capitalize">{lead.source}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-slate-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Last Updated</p>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{formatDate(lead.updatedAt)}</p>
                </div>
              </div>

            </div>
          </Card>

          {/* Follow-up Notes Timeline Card */}
          <Card className="flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
              <MessageSquare className="w-5 h-5 text-brand-500" /> Follow-up Notes
            </h3>

            {/* Note creation textarea */}
            {!isViewer && (
              <form onSubmit={handleAddNote} className="space-y-3 mb-6">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter a new follow-up note (e.g. details from call)..."
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-850 dark:text-slate-100 placeholder-slate-400 transition-all outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" loading={noteLoading} icon={<Plus className="w-4 h-4" />}>
                    Add Note
                  </Button>
                </div>
              </form>
            )}

            {/* Notes timeline list */}
            <div className="space-y-4">
              {lead.notes.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <MessageSquare className="w-10 h-10 mx-auto stroke-1 mb-1" />
                  <p className="text-sm font-semibold">No notes logged for this prospect yet.</p>
                </div>
              ) : (
                [...lead.notes].reverse().map((note) => (
                  <div
                    key={note._id}
                    className="p-4 rounded-xl border border-slate-50 dark:border-slate-800/40 bg-slate-50/30 dark:bg-slate-900/40"
                  >
                    <div className="flex justify-between items-center text-xs text-slate-450 mb-2">
                      <span className="font-bold text-slate-500 dark:text-slate-450 uppercase">
                        {note.createdBy?.name || 'Staff'}
                      </span>
                      <span className="font-semibold text-slate-400">
                        {getRelativeTime(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-750 dark:text-slate-250 leading-relaxed font-medium whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

        {/* Right 1 Column: Assignee details & Audit Timeline */}
        <div className="space-y-6">
          
          {/* Assignment widget */}
          <Card>
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
              Assigned Staff Member
            </h3>
            {lead.assignedTo ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 font-bold uppercase select-none">
                  {lead.assignedTo.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-850 dark:text-slate-200 truncate">
                    {lead.assignedTo.name}
                  </p>
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-550 truncate">
                    {lead.assignedTo.email}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-400">Unassigned</p>
            )}
          </Card>

          {/* Audit History Timeline */}
          <Card>
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Activity History
            </h3>
            
            <div className="relative border-l border-slate-100 dark:border-slate-800 ml-2.5 space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-xs font-semibold text-slate-400 pl-4">No audit logs for this lead.</p>
              ) : (
                activities.map((act) => (
                  <div key={act._id} className="relative pl-5 group">
                    <div className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-brand-600 transition-colors" />
                    <p className="text-xs font-medium text-slate-650 dark:text-slate-350 leading-relaxed">
                      {act.description}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-550 mt-0.5">
                      {getRelativeTime(act.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>

      </div>

      {/* Edit Details Modal */}
      <Modal
        isOpen={isEditModalOpen}
        title="Modify Lead Details"
        onClose={() => setIsEditModalOpen(false)}
      >
        <LeadForm
          initialData={lead}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditModalOpen(false)}
          submitLoading={submitLoading}
        />
      </Modal>

    </div>
  );
};

export default LeadDetailPage;
