import React, { useState, useEffect } from "react";
import API from "../api/axios"; // Apka axios instance
import { exportLeadsToCSV } from "../utils/exportToCSV";

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // 1. Fetch All Leads
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await API.get("/leads"); // Backend endpoint for leads
      setLeads(res.data.data || res.data || []);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // 2. Quick Status Change Handler
  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await API.patch(`/leads/${leadId}`, { status: newStatus });
      // Optimistic update state locally
      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === leadId ? { ...lead, status: newStatus } : lead,
        ),
      );
    } catch (error) {
      alert("Failed to update status. Please try again.");
      console.error("Update status error:", error);
    }
  };

  // 3. Filter Leads by Search and Status
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "All" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            CRM Leads Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Manage and track your customer pipeline
          </p>
        </div>

        <button
          onClick={() => exportLeadsToCSV(filteredLeads)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
        >
          📊 Export to CSV
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-slate-600 font-medium text-sm">
            Filter Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            Loading leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Date Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {lead.name}
                    </td>
                    <td className="py-3 px-4">
                      <div>{lead.email}</div>
                      <div className="text-xs text-slate-400">{lead.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      {/* Interactive Status Dropdown */}
                      <select
                        value={lead.status || "New"}
                        onChange={(e) =>
                          handleStatusChange(lead._id, e.target.value)
                        }
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 cursor-pointer focus:outline-none ${
                          lead.status === "Closed"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                            : lead.status === "Contacted"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : lead.status === "Qualified"
                                ? "bg-purple-100 text-purple-800 border-purple-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {lead.source || "Direct"}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
