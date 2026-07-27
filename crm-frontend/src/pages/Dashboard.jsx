import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { exportLeadsToCSV } from "../utils/exportToCSV";

const Dashboard = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // User State
  const [currentUser, setCurrentUser] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "New",
  });

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (err) {
        console.error("User parse error:", err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

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

  // Quick Status Change
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

  // Add Customer Submit
  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/customers", formData);
      setCustomers([res.data.data, ...customers]);
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        status: "New",
      });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add customer");
    }
  };

  // Edit Customer Submit
  const handleEditCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.patch(`/customers/${editCustomer._id}`, formData);
      setCustomers((prev) =>
        prev.map((item) =>
          item._id === editCustomer._id ? res.data.data : item,
        ),
      );
      setIsEditModalOpen(false);
      setEditCustomer(null);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update customer");
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;
    try {
      await API.delete(`/customers/${id}`);
      setCustomers((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      alert("Failed to delete customer");
    }
  };

  const openEditModal = (customer) => {
    setEditCustomer(customer);
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      company: customer.company || "",
      status: customer.status || "New",
    });
    setIsEditModalOpen(true);
  };

  // Filtering
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

  // Pagination Logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCustomers = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // KPI Calculations
  const totalCount = customers.length;
  const newCount = customers.filter((c) => c.status === "New").length;
  const contactedCount = customers.filter(
    (c) => c.status === "Contacted",
  ).length;
  const closedCount = customers.filter((c) => c.status === "Closed").length;

  return (
    <div className="p-8 bg-slate-900 text-slate-100 min-h-screen font-sans">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 border-b border-slate-800 pb-6">
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

        {/* Right Header: Profile + Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* User Badge */}
          <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700/80 px-3.5 py-2 rounded-2xl shadow-md">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm">
              {currentUser?.name
                ? currentUser.name.charAt(0).toUpperCase()
                : "U"}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white leading-none">
                {currentUser?.name || "Logged In User"}
              </div>
              <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mt-0.5">
                {currentUser?.role || "Superadmin"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Add Customer Button */}
            <button
              onClick={() => {
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  company: "",
                  status: "New",
                });
                setIsAddModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl font-medium shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 text-xs"
            >
              ➕ Add Customer
            </button>

            {/* Export CSV Button */}
            <button
              onClick={() => exportLeadsToCSV(filteredCustomers)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-medium shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 text-xs"
            >
              📊 Export CSV
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 px-3.5 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 text-xs"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl shadow-xl">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">
            Total Pipeline
          </div>
          <div className="text-3xl font-bold text-white mt-3">{totalCount}</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl shadow-xl">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">
            New Prospects
          </div>
          <div className="text-3xl font-bold text-amber-400 mt-3">
            {newCount}
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl shadow-xl">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">
            In Conversation
          </div>
          <div className="text-3xl font-bold text-blue-400 mt-3">
            {contactedCount}
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl shadow-xl">
          <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">
            Deals Converted
          </div>
          <div className="text-3xl font-bold text-emerald-400 mt-3">
            {closedCount}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl shadow-lg mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search by customer name, email, phone, or company..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:w-1/2 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
        />

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-slate-400 font-medium text-xs uppercase">
            Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 font-medium">
            Syncing customer records...
          </div>
        ) : currentCustomers.length === 0 ? (
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
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {currentCustomers.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {item.email} • {item.phone}
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
                        className="text-xs font-bold px-3 py-1.5 rounded-full border bg-slate-900 text-slate-200 border-slate-700"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {item.assignedTo?.name || "Unassigned"}
                    </td>
                    <td className="py-4 px-6 flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(item._id)}
                        className="bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-700/80 bg-slate-900/40 flex justify-between items-center text-xs text-slate-400">
          <div>
            Page {currentPage} of {totalPages} ({filteredCustomers.length}{" "}
            Total)
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {isEditModalOpen ? "Edit Customer Details" : "Add New Customer"}
            </h2>
            <form
              onSubmit={
                isEditModalOpen
                  ? handleEditCustomerSubmit
                  : handleAddCustomerSubmit
              }
              className="space-y-4"
            >
              <div>
                <label className="text-xs text-slate-400 uppercase font-semibold">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-semibold">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-semibold">
                  Phone
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-semibold">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none mt-1"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 border border-slate-700 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                >
                  {isEditModalOpen ? "Save Changes" : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
