import React, { useState } from "react";
import API from "../api/axiosInstance";
import { X, UserPlus } from "lucide-react";

const AddLeadModal = ({ isOpen, onClose, onLeadAdded }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    status: "New",
    estimatedValue: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/customers", formData);
      if (res.data.success) {
        onLeadAdded();
        onClose();
        setFormData({
          name: "",
          email: "",
          phone: "",
          status: "New",
          estimatedValue: "",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lead");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <UserPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Add New Customer Lead
            </h2>
            <p className="text-xs text-slate-400">
              Enter lead details to assign to sales pipeline
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="rahul@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Closed Won">Closed Won</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase">
                Est. Value ($)
              </label>
              <input
                type="number"
                value={formData.estimatedValue}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedValue: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;
