import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Input from '../common/Input';
import Button from '../common/Button';

const LeadForm = ({ initialData = null, onSubmit, onCancel, submitLoading = false }) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    company: initialData?.company || '',
    status: initialData?.status || 'new',
    source: initialData?.source || 'website',
    value: initialData?.value !== undefined && initialData?.value !== null ? initialData.value : '',
    assignedTo: initialData?.assignedTo?._id || initialData?.assignedTo || '',
  });

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await api.get('/auth/users');
        if (response.data.success) {
          setUsers(response.data.data);
          
          // Set default assignee to first user if adding and not set
          if (!formData.assignedTo && response.data.data.length > 0) {
            setFormData(prev => ({
              ...prev,
              assignedTo: response.data.data[0]._id
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load team users:', error);
        showToast('Failed to load staff list for assignment', 'error');
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Lead name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    const numVal = parseFloat(formData.value) || 0;
    if (numVal < 0) newErrors.value = 'Value cannot be negative';
    if (!formData.assignedTo) newErrors.assignedTo = 'Lead must be assigned to an staff member';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      value: parseFloat(formData.value) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-slide-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Lead Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
        />

        <Input
          label="Company Name"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Enterprise Inc."
        />

        {/* Status Dropdown */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Lead Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-all outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal sent">Proposal Sent</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* Source Dropdown */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Lead Source
          </label>
          <select
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-all outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="social">Social Media</option>
            <option value="advertisement">Advertisement</option>
            <option value="other">Other</option>
          </select>
        </div>

        <Input
          label="Deal Value ($)"
          name="value"
          type="number"
          value={formData.value}
          onChange={handleChange}
          error={errors.value}
          min="0"
          step="any"
        />

        {/* Assigned Staff Dropdown */}
        <div className="flex flex-col gap-1.5 w-full">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Assigned Staff member {usersLoading && '(loading...)'}
          </label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            disabled={usersLoading}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 transition-all outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50"
          >
            {users.map(u => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
          {errors.assignedTo && (
            <span className="text-xs text-rose-500 font-medium">
              {errors.assignedTo}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitLoading}>
          {initialData ? 'Update Lead' : 'Add Lead'}
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;
