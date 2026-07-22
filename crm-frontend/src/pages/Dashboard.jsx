import React, { useEffect, useState, useContext } from "react";
import API from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import AddLeadModal from "../components/AddLeadModal";
import {
  Users,
  PhoneCall,
  DollarSign,
  LogOut,
  Search,
  Filter,
  RefreshCw,
  UserPlus,
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  // States
  const [stats, setStats] = useState({
    totalLeads: 0,
    pipelineValue: 0,
    statusBreakdown: [],
  });
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Dashboard Stats & Customers
  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, custRes] = await Promise.all([
        API.get("/dashboard/stats"),
        API.get(
          `/customers?page=${page}&limit=10&search=${search}&status=${statusFilter}`,
        ),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (custRes.data.success) {
        setCustomers(custRes.data.data);
        setTotalPages(custRes.data.totalPages);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* Top Navbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8 shadow-lg gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">
            Enterprise CRM Portal
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Logged in as{" "}
            <span className="text-indigo-400 font-semibold">{user?.name}</span>{" "}
            ({user?.role?.toUpperCase()})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-indigo-600/30"
          >
            <UserPlus size={18} /> Add New Lead
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-red-600/20"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Analytics KPI Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Users size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">
              Total Managed Leads
            </p>
            <h3 className="text-3xl font-bold text-white mt-1">
              {stats.totalLeads || 0}
            </h3>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">
              Pipeline Total Value
            </p>
            <h3 className="text-3xl font-bold text-emerald-400 mt-1">
              ${stats.pipelineValue || 0}
            </h3>
          </div>
        </div>

        <div className="bg-slate-800/90 border border-slate-700 p-6 rounded-2xl flex items-center gap-4 shadow-md">
          <div className="p-4 bg-amber-500/10 text-amber-400 rounded-xl">
            <PhoneCall size={32} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">System Status</p>
            <h3 className="text-lg font-bold text-amber-400 mt-1">
              10k Scale Engine Active
            </h3>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-1/2">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, email or phone across 10k leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 pl-10 pr-4 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition"
          >
            Search
          </button>
        </form>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg">
            <Filter size={16} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-sm text-white focus:outline-none"
            >
              <option value="" className="bg-slate-800">
                All Statuses
              </option>
              <option value="New" className="bg-slate-800">
                New
              </option>
              <option value="Contacted" className="bg-slate-800">
                Contacted
              </option>
              <option value="Interested" className="bg-slate-800">
                Interested
              </option>
              <option value="Closed Won" className="bg-slate-800">
                Closed Won
              </option>
            </select>
          </div>

          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Customer Leads Data Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Status</th>
                <th className="p-4">Assigned Telecaller</th>
                <th className="p-4">Est. Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-slate-400">
                    Loading 10k indexed records...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-8 text-slate-400">
                    No leads found matching query.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-700/30 transition">
                    <td className="p-4 font-semibold text-white">{c.name}</td>
                    <td className="p-4 text-slate-300">
                      <div>{c.email}</div>
                      <div className="text-xs text-slate-400">{c.phone}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          c.status === "Closed Won"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : c.status === "Interested"
                              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">
                      {c.assignedTo ? (
                        c.assignedTo.name
                      ) : (
                        <span className="text-slate-500 italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-emerald-400">
                      ${c.estimatedValue || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-between items-center text-sm">
          <span className="text-slate-400">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded transition"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white rounded transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Lead Modal Component */}
      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeadAdded={fetchData}
      />
    </div>
  );
};

export default Dashboard;
