"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QrCode, Search, LogOut, Download, CheckCircle2, XCircle } from "lucide-react";
import * as XLSX from "xlsx";

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/admin/login");
      } else {
        setSession(session);
        fetchRegistrations();
      }
    });
  }, [router]);

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("registrations")
      .select("*, check_ins(*)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRegistrations(data);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const exportToExcel = () => {
    const dataToExport = filteredRegistrations.map((reg) => ({
      "Registration ID": reg.registration_id,
      "Player Name": reg.full_name,
      "Mobile": reg.mobile,
      "Email": reg.email,
      "Category": reg.category,
      "Amount": reg.amount,
      "Payment Status": reg.payment_status,
      "Registration Status": reg.registration_status,
      "Razorpay Order ID": reg.razorpay_order_id || "N/A",
      "Razorpay Payment ID": reg.razorpay_payment_id || "N/A",
      "Check-in Status": reg.check_ins && reg.check_ins.length > 0 ? "Present" : "Not Present",
      "Check-in Time": reg.check_ins && reg.check_ins.length > 0 ? new Date(reg.check_ins[0].checked_in_at).toLocaleString() : "N/A",
      "Registration Date": new Date(reg.created_at).toLocaleString(),
      "DOB": reg.date_of_birth,
      "Gender": reg.gender,
      "City": reg.city,
      "State": reg.state,
      "Partner Name": reg.partner_name || "N/A",
      "Partner Mobile": reg.partner_mobile || "N/A",
      "T-Shirt": reg.tshirt_size || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
    XLSX.writeFile(workbook, `Badminton_Tournament_Registrations_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Stats
  const totalRegistrations = registrations.length;
  const paidRegistrations = registrations.filter(r => r.payment_status === "PAID");
  const totalRevenue = paidRegistrations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const checkedInCount = paidRegistrations.filter(r => r.check_ins && r.check_ins.length > 0).length;

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      reg.registration_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.mobile.includes(searchQuery);
    const matchesCategory = filterCategory === "All" || reg.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin Navbar */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white px-2 py-1 rounded">
              <img src="/logo.png" alt="SMASHPRO" className="h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Admin</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/scanner" className="hidden sm:flex items-center gap-2 bg-primary px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
              <QrCode className="h-4 w-4" /> Open Scanner
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6 space-y-6">
        {/* Mobile Scanner Button */}
        <div className="sm:hidden mb-4">
          <Link href="/admin/scanner" className="w-full flex justify-center items-center gap-2 bg-primary px-4 py-3 rounded-xl font-bold text-white shadow hover:bg-primary/90 transition-colors">
            <QrCode className="h-5 w-5" /> OPEN QR SCANNER
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm text-muted-foreground font-medium">Total Registrations</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{totalRegistrations}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm text-muted-foreground font-medium">Paid & Confirmed</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{paidRegistrations.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">LIVE</div>
            <p className="text-sm text-muted-foreground font-medium">Checked In</p>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-3xl font-bold text-slate-900">{checkedInCount}</p>
              <p className="text-sm text-slate-500 mb-1">/ {paidRegistrations.length}</p>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
              <div className="bg-primary h-1.5 rounded-full" style={{ width: `${paidRegistrations.length > 0 ? (checkedInCount/paidRegistrations.length)*100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Filters and Table Controls */}
        <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, ID, mobile..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="All">All Categories</option>
              <option value="Men's Singles">Men's Singles</option>
              <option value="Women's Singles">Women's Singles</option>
              <option value="Men's Doubles">Men's Doubles</option>
              <option value="Women's Doubles">Women's Doubles</option>
              <option value="Mixed Doubles">Mixed Doubles</option>
            </select>
          </div>
          <button 
            onClick={exportToExcel}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" /> Export Excel
          </button>
        </div>

        {/* Data View */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border">Loading registrations...</div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border">No registrations found</div>
          ) : (
            <>
              {/* MOBILE VIEW: Stacked Cards */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredRegistrations.map((reg) => {
                  const isCheckedIn = reg.check_ins && reg.check_ins.length > 0;
                  return (
                    <div key={reg.id} className="bg-white border rounded-xl p-4 shadow-sm space-y-3 relative overflow-hidden">
                      <div className="flex justify-between items-start border-b pb-3">
                        <div>
                          <p className="font-mono text-xs font-bold text-slate-500">{reg.registration_id}</p>
                          <p className="font-bold text-slate-900 text-lg mt-0.5">{reg.full_name}</p>
                          <p className="text-sm text-slate-500">{reg.mobile}</p>
                        </div>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          reg.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {reg.payment_status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600 font-medium">{reg.category}</span>
                        {isCheckedIn ? (
                          <span className="flex items-center text-green-600 font-bold">
                            <CheckCircle2 className="h-4 w-4 mr-1" /> PRESENT
                          </span>
                        ) : (
                          <span className="flex items-center text-slate-400">
                            <XCircle className="h-4 w-4 mr-1" /> Pending
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 text-right pt-2">
                        {new Date(reg.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP VIEW: Data Table */}
              <div className="hidden md:block bg-white border rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Player</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Check-in</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegistrations.map((reg) => {
                      const isCheckedIn = reg.check_ins && reg.check_ins.length > 0;
                      return (
                        <tr key={reg.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-mono font-medium text-slate-900">{reg.registration_id}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{reg.full_name}</p>
                            <p className="text-xs text-slate-500">{reg.mobile}</p>
                          </td>
                          <td className="px-4 py-3">{reg.category}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                              reg.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {reg.payment_status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {isCheckedIn ? (
                              <span className="flex items-center text-green-600 text-xs font-bold">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> PRESENT
                              </span>
                            ) : (
                              <span className="flex items-center text-slate-400 text-xs">
                                <XCircle className="h-3 w-3 mr-1" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {new Date(reg.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
