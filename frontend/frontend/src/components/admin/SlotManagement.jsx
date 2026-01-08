import { useEffect, useState } from 'react'
import { Calendar, Save, RefreshCw, User, Check } from 'lucide-react'
import api from '../../services/api'

const SlotManagement = () => {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [creating, setCreating] = useState(false)
    const [therapists, setTherapists] = useState([])
    const [selectedTherapist, setSelectedTherapist] = useState('')
    const [baseDate, setBaseDate] = useState(() => new Date().toISOString().slice(0, 10))
    const [selectedDays, setSelectedDays] = useState([])
    const [includeAddon, setIncludeAddon] = useState(false)
    const [previewTimes, setPreviewTimes] = useState([])
    const [form, setForm] = useState({
        slot_duration_minutes: 60,
        slot_addon_minutes: 30,
        slot_gap_minutes: 60,
        slot_start_time: '08:00',
        slot_end_time: '20:00'
    })

    const num = (v, d) => {
        const n = Number(v)
        return Number.isFinite(n) && n >= 0 ? n : d
    }
    const load = async () => {
        try {
            setLoading(true)
            const res = await api.get('/admin/settings')
            const map = {}
                ; (res.data.settings || []).forEach(s => { map[s.key] = s.value })
            const next = {
                slot_duration_minutes: num(map.slot_duration_minutes, 60),
                slot_addon_minutes: num(map.slot_addon_minutes, 30),
                slot_gap_minutes: num(map.slot_gap_minutes, 60),
                slot_start_time: String(map.slot_start_time ?? '08:00'),
                slot_end_time: String(map.slot_end_time ?? '20:00')
            }
            setForm(next)
        } catch (e) {
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load(); loadTherapists() }, [])

    const loadTherapists = async () => {
        try {
            const res = await api.get('/admin/therapists?limit=100')
            setTherapists(res.data.therapists || [])
            if (res.data.therapists?.length) setSelectedTherapist(res.data.therapists[0]._id)
        } catch (e) { }
    }

    const update = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const save = async () => {
        try {
            setSaving(true)
            const settings = [
                { key: 'slot_duration_minutes', value: Number(form.slot_duration_minutes), type: 'number', category: 'app', isPublic: true },
                { key: 'slot_addon_minutes', value: Number(form.slot_addon_minutes), type: 'number', category: 'app', isPublic: true },
                { key: 'slot_gap_minutes', value: Number(form.slot_gap_minutes), type: 'number', category: 'app', isPublic: true },
                { key: 'slot_start_time', value: String(form.slot_start_time), type: 'string', category: 'app', isPublic: true },
                { key: 'slot_end_time', value: String(form.slot_end_time), type: 'string', category: 'app', isPublic: true }
            ]
            await api.put('/admin/settings', { settings })
            if (!selectedTherapist) {
                alert('Select therapist')
            } else {
                const payload = {
                    slotDurationMinutes: Number(form.slot_duration_minutes),
                    slotAddonMinutes: Number(form.slot_addon_minutes),
                    slotGapMinutes: Number(form.slot_gap_minutes),
                    slotStartTime: normalizeTime(form.slot_start_time),
                    slotEndTime: normalizeTime(form.slot_end_time),
                    includeAddon,
                    days: selectedDays,
                    baseDate
                }
                await api.post(`/admin/therapists/${selectedTherapist}/slot-config`, payload)
                const start = toMinutes(form.slot_start_time)
                const end = toMinutes(form.slot_end_time)
                const step = Number(form.slot_duration_minutes) + Number(form.slot_gap_minutes)
                const addon = Number(form.slot_addon_minutes)
                const out = []
                let t = start
                if (!Number.isNaN(start) && !Number.isNaN(end) && step > 0 && start <= end) {
                    while (t <= end) { out.push(toHHMM(t)); t += step }
                    let times = out
                    if (includeAddon && addon > 0) {
                        const withAddon = out.flatMap(base => {
                            const bm = toMinutes(base)
                            const am = bm + addon
                            const av = am <= end ? toHHMM(am) : null
                            return av ? [base, av] : [base]
                        })
                        times = Array.from(new Set(withAddon))
                    }
                    const baseObj = new Date(baseDate)
                    const dayIndexMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }
                    const dates = selectedDays.length ? selectedDays.map(d => {
                        const day = dayIndexMap[d]
                        const diff = (day - baseObj.getDay() + 7) % 7
                        const target = new Date(baseObj)
                        target.setDate(baseObj.getDate() + diff)
                        return target.toISOString().slice(0, 10)
                    }) : [baseDate]
                    const slots = dates.flatMap(date => times.map(t => ({
                        slotDate: date,
                        slotTime: t,
                        startTime: t,
                        endTime: toHHMM(toMinutes(t) + Number(form.slot_duration_minutes)),
                        status: 'available'
                    })))
                    if (slots.length > 0) await api.post(`/admin/therapists/${selectedTherapist}/slots`, { slots })
                }
            }
            alert('Slot settings saved')
        } catch (e) {
            alert(e.response?.data?.message || e.message)
        } finally {
            setSaving(false)
        }
    }

    const normalizeTime = (input) => {
        const raw = String(input).trim()
        const ampm = /(am|pm)$/i.test(raw) ? raw.toLowerCase().slice(-2) : ''
        const core = raw.replace(/\s*(am|pm)$/i, '')
        const [hStr, mStr] = core.split(':')
        let h = Number(hStr)
        const m = Number((mStr || '0').replace(/[^0-9]/g, ''))
        if (Number.isNaN(h) || Number.isNaN(m)) return null
        if (ampm === 'pm' && h < 12) h += 12
        if (ampm === 'am' && h === 12) h = 0
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
    const toMinutes = (s) => {
        const norm = normalizeTime(s)
        if (!norm) return NaN
        const [h, m] = norm.split(':').map(Number)
        return h * 60 + m
    }
    const toHHMM = (mins) => {
        const h = Math.floor(mins / 60)
        const m = mins % 60
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
    const generateTimes = () => {
        const start = toMinutes(form.slot_start_time)
        const end = toMinutes(form.slot_end_time)
        const step = Number(form.slot_duration_minutes) + Number(form.slot_gap_minutes)
        const addon = Number(form.slot_addon_minutes)
        const out = []
        let t = start
        if (Number.isNaN(start) || Number.isNaN(end) || step <= 0 || start > end) {
            setPreviewTimes([])
            return
        }
        while (t <= end) {
            out.push(toHHMM(t))
            t += step
        }
        if (includeAddon && addon > 0) {
            const withAddon = out.flatMap(base => {
                const bm = toMinutes(base)
                const am = bm + addon
                const av = am <= end ? toHHMM(am) : null
                return av ? [base, av] : [base]
            })
            setPreviewTimes(Array.from(new Set(withAddon)))
        } else {
            setPreviewTimes(out)
        }
    }

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const toggleDay = (d) => {
        setSelectedDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
    }

    const createSlots = async () => {
        try {
            if (!selectedTherapist) return alert('Select therapist')
            if (previewTimes.length === 0) {
                generateTimes()
            }
            if (previewTimes.length === 0) return alert('Enter valid start/end time and Generate times')
            setCreating(true)
            const base = new Date(baseDate)
            const dayIndexMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }
            const dates = selectedDays.length ? selectedDays.map(d => {
                const day = dayIndexMap[d]
                const diff = (day - base.getDay() + 7) % 7
                const target = new Date(base)
                target.setDate(base.getDate() + diff)
                return target.toISOString().slice(0, 10)
            }) : [baseDate]
            const slots = dates.flatMap(date => previewTimes.map(t => ({
                slotDate: date,
                slotTime: t,
                startTime: t,
                endTime: toHHMM(toMinutes(t) + Number(form.slot_duration_minutes)),
                status: 'available'
            })))
            await api.post(`/admin/therapists/${selectedTherapist}/slots`, { slots })
            alert('Slots created')
        } catch (e) {
            alert(e.response?.data?.message || e.message)
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Slot Management</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={load} className="px-3 py-2 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                        <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50 font-medium">
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Slot Duration (minutes)</label>
                        <input type="number" min="15" step="15" value={form.slot_duration_minutes} onChange={e => update('slot_duration_minutes', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Addon (minutes)</label>
                        <input type="number" min="0" step="5" value={form.slot_addon_minutes} onChange={e => update('slot_addon_minutes', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Slot Gap (minutes)</label>
                        <input type="number" min="0" step="15" value={form.slot_gap_minutes} onChange={e => update('slot_gap_minutes', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
                        <input type="time" value={normalizeTime(form.slot_start_time) || ''} onChange={e => update('slot_start_time', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Time</label>
                        <input type="time" value={normalizeTime(form.slot_end_time) || ''} onChange={e => update('slot_end_time', e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/10 rounded-xl p-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Therapist</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <select value={selectedTherapist} onChange={e => setSelectedTherapist(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white appearance-none">
                                    {therapists.map(t => (
                                        <option key={t._id} value={t._id}>{t.name} (+91 {t.phone})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Base Date</label>
                            <input type="date" value={baseDate} onChange={e => setBaseDate(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                        {daysOfWeek.map(d => (
                            <button key={d} onClick={() => toggleDay(d)} className={`px-3 py-1 rounded-lg text-sm border transition-colors ${selectedDays.includes(d)
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                                }`}>{d}</button>
                        ))}
                        <label className="ml-auto inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input type="checkbox" checked={includeAddon} onChange={e => setIncludeAddon(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-900 dark:border-white/10" />
                            Include addon slots
                        </label>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button onClick={generateTimes} className="px-4 py-2 border border-gray-300 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium">Generate Times</button>
                        <button onClick={createSlots} disabled={creating || !selectedTherapist} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-2 transition-colors shadow-lg shadow-green-500/20 font-medium">
                            <Check className="w-4 h-4" />
                            Create Slots
                        </button>
                    </div>
                    {previewTimes.length > 0 && (
                        <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {previewTimes.map(t => (
                                <div key={t} className="px-3 py-2 rounded-lg text-sm font-medium border bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-white/10 text-center shadow-sm">{t}</div>
                            ))}
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="p-4 text-gray-600 dark:text-gray-400 text-center mt-4">Loading settings...</div>
                )}
            </div>
        </div>
    )
}

export default SlotManagement
