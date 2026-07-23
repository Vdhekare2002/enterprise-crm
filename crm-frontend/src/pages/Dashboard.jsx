import React, { useState, useEffect } from "react";
import API from "../api/axios";
import { exportLeadsToCSV } from "../utils/exportToCSV";

const Dashboard = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // 1. Fetch Customers from /api/v1/customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      // 🔥 EXACT API MATCH HERE
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

  // 2. Status Change Handler
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

  // 3. Filter Search & Status
  const filteredCustomers = customers.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.phone?.includes(searchTerm);

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            CRM Customer Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            Manage customers & lead status
          </p>
        </div>

        {/* Export CSV Button */}
        <button
          onClick={() => exportLeadsToCSV(filteredCustomers)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
        >
          📊 Export to CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-slate-600 font-medium text-sm">Status:</label>
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No data found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assigned To</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredCustomers.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.name}
                    </td>
                    <td className="py-3 px-4">
                      <div>{item.email}</div>
                      <div className="text-xs text-slate-400">{item.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.company || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={item.status || "New"}
                        onChange={(e) =>
                          handleStatusChange(item._id, e.target.value)
                        }
                        className="text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-200 bg-amber-50 text-amber-800"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {item.assignedTo?.name || "Unassigned"}
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
