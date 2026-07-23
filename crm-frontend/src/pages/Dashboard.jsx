import React, { useState, useEffect } from "react";
import API from "../api/axiosInstance";
import { exportLeadsToCSV } from "../utils/exportToCSV";

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/customers");
      setCustomers(res.data.data || []);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleStatusChange = async (customerId, newStatus) => {
    try {
      await API.patch(`/customers/${customerId}`, { status: newStatus });
      setCustomers((prev) =>
        prev.map((item) =>
          item._id === customerId ? { ...item, status: newStatus } : item,
        ),
      );
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const filteredCustomers = customers.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone?.includes(searchTerm) ||
      item.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics for KPI Cards
  const totalCount = customers.length;
  const newCount = customers.filter((c) => c.status === "New").length;
  const contactedCount = customers.filter(
    (c) => c.status === "Contacted",
  ).length;
  const closedCount = customers.filter((c) => c.status === "Closed").length;

  return (
    <div className="p-8 bg-slate-900 text-slate-100 min-h-screen font-sans">
      {/* Top Bar / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Enterprise Suite
            </span>
            <span className="text-xs text-slate-500">• Live Pipeline</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Customer Relationship Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track leads, update pipeline statuses, and export business data in
            real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportLeadsToCSV(filteredCustomers)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Stats Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            Total Pipeline
            <span className="p-2 bg-slate-700/50 rounded-lg text-slate-300">
              👥
            </span>
          </div>
          <div className="text-3xl font-bold text-white mt-3">{totalCount}</div>
          <p className="text-xs text-slate-500 mt-1">All registered accounts</p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            New Prospects
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              🔥
            </span>
          </div>
          <div className="text-3xl font-bold text-amber-400 mt-3">
            {newCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Awaiting initial response
          </p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            In Conversation
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              📞
            </span>
          </div>
          <div className="text-3xl font-bold text-blue-400 mt-3">
            {contactedCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Active telecaller follow-ups
          </p>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
            Deals Converted
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              🎉
            </span>
          </div>
          <div className="text-3xl font-bold text-emerald-400 mt-3">
            {closedCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Successfully closed deals
          </p>
        </div>
      </div>

      {/* Control Bar (Search & Filters) */}
      <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl shadow-lg mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <svg
            className="w-5 h-5 absolute left-3.5 top-3 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by customer name, email, phone, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-slate-400 font-medium text-xs uppercase tracking-wider">
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl">
        {loading ? (
          <div className="p-16 text-center text-slate-400 font-medium flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            Syncing customer records...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            No customers match your search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-700 text-slate-400 text-xs uppercase font-bold tracking-wider">
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Company</th>
                  <th className="py-4 px-6">Pipeline Status</th>
                  <th className="py-4 px-6">Assigned Agent</th>
                  <th className="py-4 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {filteredCustomers.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                          {item.name ? item.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.email} • {item.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-300 font-medium">
                      {item.company || "Individual"}
                    </td>

                    <td className="py-4 px-6">
                      <select
                        value={item.status || "New"}
                        onChange={(e) =>
                          handleStatusChange(item._id, e.target.value)
                        }
                        className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none transition-all ${
                          item.status === "Closed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : item.status === "Contacted"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : item.status === "Qualified"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        <option
                          value="New"
                          className="bg-slate-900 text-slate-200"
                        >
                          New
                        </option>
                        <option
                          value="Contacted"
                          className="bg-slate-900 text-slate-200"
                        >
                          Contacted
                        </option>
                        <option
                          value="Qualified"
                          className="bg-slate-900 text-slate-200"
                        >
                          Qualified
                        </option>
                        <option
                          value="Closed"
                          className="bg-slate-900 text-slate-200"
                        >
                          Closed
                        </option>
                      </select>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        {item.assignedTo?.name || "Unassigned"}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-400 text-xs">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"}
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
