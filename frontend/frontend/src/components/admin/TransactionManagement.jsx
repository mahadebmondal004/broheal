import { useEffect, useState } from 'react';
import { Search, Filter, Edit, Trash2, DollarSign, X } from 'lucide-react';
import api from '../../services/api';

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: '', status: '', search: '', page: 1, limit: 20 });
  const [totalPages, setTotalPages] = useState(1);
  const [showEdit, setShowEdit] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [form, setForm] = useState({ amount: '', status: 'pending', paymentMode: 'razorpay', gatewayOrderId: '', gatewayTransactionId: '' });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteRevenue, setConfirmDeleteRevenue] = useState(false);

  useEffect(() => { load(); }, [filters]);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set('type', filters.type);
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);
      params.set('page', String(filters.page));
      params.set('limit', String(filters.limit));
      const res = await api.get(`/admin/transactions?${params.toString()}`);
      setTransactions(res.data.transactions || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (e) {
      setTransactions([]);
    } finally { setLoading(false); }
  };

  const openEdit = (tx) => {
    setEditingTx(tx);
    setForm({
      amount: tx.amount,
      status: tx.status,
      paymentMode: tx.paymentMode || 'razorpay',
      gatewayOrderId: tx.gatewayOrderId || '',
      gatewayTransactionId: tx.gatewayTransactionId || ''
    });
    setShowEdit(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/transactions/${editingTx._id}`, form);
      setShowEdit(false);
      setEditingTx(null);
      await load();
    } catch (error) { }
  };

  const doDelete = async () => {
    try {
      await api.delete(`/admin/transactions/${confirmDelete._id}`);
      setConfirmDelete(null);
      await load();
    } catch (error) { }
  };

  const doDeleteRevenue = async () => {
    try {
      await api.delete('/admin/transactions/revenue');
      setConfirmDeleteRevenue(false);
      await load();
    } catch (error) { }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Transactions</h3>
          </div>
          {/* <div className="flex gap-2">
            <button className="btn-primary bg-red-600 hover:bg-red-700" onClick={() => setConfirmDeleteRevenue(true)}>Delete All Revenue</button>
          </div> */}
        </div>
        <div className="px-6 py-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex-1 flex flex-col md:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Search by user/therapist name or phone"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
              >
                <option value="">All Types</option>
                <option value="payment">Payment</option>
                <option value="wallet_credit">Wallet Credit</option>
                <option value="commission">Commission</option>
                <option value="withdrawal">Withdrawal</option>
              </select>
              <select
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 dark:bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Mode</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Therapist</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {loading ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                  Loading...
                </td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No transactions found</td></tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs border border-blue-200 dark:border-blue-800">{t.transactionType}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">₹{t.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs border ${t.status === 'success'
                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                        : t.status === 'failed'
                          ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
                          : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800'
                        }`}>{t.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{t.paymentMode || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">
                      {t.userId ? (
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{t.userId.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">+91 {t.userId.phone}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300 text-sm">
                      {t.therapistId ? (
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{t.therapistId.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">+91 {t.therapistId.phone}</div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors" onClick={() => openEdit(t)} title="Edit"><Edit className="w-4 h-4" /></button>
                        <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors" onClick={() => setConfirmDelete(t)} title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 flex items-center justify-end gap-2 border-t border-gray-200 dark:border-white/10">
          <button
            className="px-3 py-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            disabled={filters.page <= 1}
            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
          >Prev</button>
          <span className="text-sm text-gray-600 dark:text-gray-400">Page {filters.page} of {totalPages}</span>
          <button
            className="px-3 py-1 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg text-sm text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            disabled={filters.page >= totalPages}
            onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
          >Next</button>
        </div>
      </div>

      {showEdit && editingTx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Transaction</h3>
              <button onClick={() => setShowEdit(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                <input type="number" className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Mode</label>
                <select className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white" value={form.paymentMode} onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}>
                  <option value="razorpay">Razorpay</option>
                  <option value="paytm">Paytm</option>
                  <option value="wallet">Wallet</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gateway Order ID</label>
                <input className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white" value={form.gatewayOrderId} onChange={(e) => setForm({ ...form, gatewayOrderId: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gateway Txn ID</label>
                <input className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white" value={form.gatewayTransactionId} onChange={(e) => setForm({ ...form, gatewayTransactionId: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/10 mt-4">
                <button type="button" className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" onClick={() => setShowEdit(false)}>Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20 font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-white/10 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Transaction</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete transaction of <span className="font-semibold text-gray-900 dark:text-white">₹{confirmDelete.amount}</span>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 font-medium" onClick={doDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteRevenue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-white/10 shadow-2xl text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete All Revenue Transactions</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Yeh action saare successful payment (revenue) transactions ko DB se hata dega. Aap confirm karna chahte hain?</p>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors" onClick={() => setConfirmDeleteRevenue(false)}>Cancel</button>
              <button className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 font-medium" onClick={doDeleteRevenue}>Delete All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;
