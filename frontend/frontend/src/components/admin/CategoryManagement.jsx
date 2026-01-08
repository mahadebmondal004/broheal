import { useEffect, useState } from 'react'
import { Package, Plus, Trash2, Pencil, X } from 'lucide-react'
import api from '../../services/api'

const CategoryManagement = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', status: 'active', displayOrder: 0, image: '' })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({ _id: '', name: '', description: '', status: 'active', displayOrder: 0, image: '' })
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  const uploadToCloudinary = async (file) => {
    if (!cloudName || !uploadPreset) return null
    try {
      setUploadingImage(true)
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
      const fd = new FormData()
      fd.append('file', file)
      fd.append('upload_preset', uploadPreset)
      const res = await fetch(url, { method: 'POST', body: fd })
      const data = await res.json()
      return data.secure_url || null
    } catch { return null } finally { setUploadingImage(false) }
  }

  const load = async () => {
    try {
      setLoading(true)
      const r = await api.get('/admin/categories')
      setCategories(r.data.categories || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const add = async (e) => {
    e.preventDefault()
    try {
      await api.post('/admin/categories', form)
      setShowAdd(false)
      setForm({ name: '', description: '', status: 'active', displayOrder: 0 })
      load()
    } catch (e) {
      const msg = e.response?.data?.message || e.message
      const status = e.response?.status
      if (status === 404 || /Route not found/i.test(msg)) {
        alert(`Backend route not available: POST ${import.meta.env.VITE_API_BASE_URL}/admin/categories`)
      } else if (status === 401) {
        alert('Unauthorized. Please login as admin again.')
      } else {
        alert('Failed: ' + msg)
      }
    }
  }

  const del = async (id) => {
    if (!confirm('Delete this category?')) return
    try { await api.delete(`/admin/categories/${id}`); load() } catch { }
  }

  const openEdit = (c) => {
    setEditForm({
      _id: c._id,
      name: c.name || '',
      description: c.description || '',
      status: c.status || 'active',
      displayOrder: typeof c.displayOrder === 'number' ? c.displayOrder : 0,
      image: c.image || ''
    })
    setShowEdit(true)
  }

  const saveEdit = async (e) => {
    e.preventDefault()
    try {
      const { _id, ...payload } = editForm
      await api.put(`/admin/categories/${_id}`, payload)
      setShowEdit(false)
      setEditForm({ _id: '', name: '', description: '', status: 'active', displayOrder: 0, image: '' })
      load()
    } catch (e) {
      const msg = e.response?.data?.message || e.message
      const status = e.response?.status
      if (status === 404 || /Route not found/i.test(msg)) {
        alert(`Backend route not available: PUT ${import.meta.env.VITE_API_BASE_URL}/admin/categories/:id`)
      } else if (status === 401) {
        alert('Unauthorized. Please login as admin again.')
      } else {
        alert('Failed: ' + msg)
      }
    }
  }

  return (
    <>
      <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 card-3d p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Category Management</h3>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-medium btn-3d press-effect">
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            Loading categories...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
            <table className="w-full">
              <thead className="bg-gray-50/50 dark:bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                {categories.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/10">
                        <img src={c.image || 'https://via.placeholder.com/80x80?text=Cat'} alt={c.name} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{c.name}</td>
                    <td className="px-6 py-3 text-gray-700 dark:text-gray-300">{c.description}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full border ${c.status === 'active'
                        ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800'
                        : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                        }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{c.displayOrder}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(c)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => del(c._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Modals - Rendered outside main container */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Add Category</h4>
              <button onClick={() => setShowAdd(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={add} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" rows="3" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Image</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const url = await uploadToCloudinary(file)
                  if (url) setForm(prev => ({ ...prev, image: url }))
                }} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300" />
                {uploadingImage && <div className="text-xs text-blue-500 mt-1">Uploading...</div>}
                {form.image && (
                  <div className="mt-2 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white">
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Order</label>
                  <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/10 mt-4">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Edit Category</h4>
              <button onClick={() => setShowEdit(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveEdit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" rows="3" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Image</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const url = await uploadToCloudinary(file)
                  if (url) setEditForm(prev => ({ ...prev, image: url }))
                }} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300" />
                {uploadingImage && <div className="text-xs text-blue-500 mt-1">Uploading...</div>}
                {editForm.image && (
                  <div className="mt-2 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-white/10">
                    <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white">
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">Order</label>
                  <input type="number" value={editForm.displayOrder} onChange={e => setEditForm({ ...editForm, displayOrder: Number(e.target.value) })} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/10 mt-4">
                <button type="button" onClick={() => setShowEdit(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 font-medium">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default CategoryManagement

