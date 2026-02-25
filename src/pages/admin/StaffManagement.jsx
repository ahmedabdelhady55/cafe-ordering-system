import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, Plus, Edit, Trash2, Shield, Key, UserPlus, X, Check, 
  ArrowLeft, Search, Eye, EyeOff, Save, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function StaffManagement() {
  const [staff, setStaff] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  // 🔹 بيانات نموذج الموظف
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    phone: '',
    role: 'waiter',
    isActive: true,
    permissions: {
      orders: { view: true, update_status: true, cancel: false, refund: false },
      menu: { view: true, add_item: false, edit_item: false, delete_item: false, toggle_availability: true },
      reports: { view_daily: false, view_analytics: false, export_data: false },
      staff_management: false
    }
  })

  // 🔹 تحميل البيانات
  useEffect(() => {
    loadStaffData()
  }, [])

  const loadStaffData = () => {
    // 🎭 Mock Data (هتتبدل بـ Firebase لاحقاً)
    const mockStaff = [
      { 
        id: 'STF-001', 
        name: 'أحمد محمد', 
        username: 'ahmed.admin', 
        phone: '+201001234567',
        role: 'admin', 
        isActive: true,
        lastLogin: '2024-01-15 14:30',
        permissions: {
          orders: { view: true, update_status: true, cancel: true, refund: true },
          menu: { view: true, add_item: true, edit_item: true, delete_item: true, toggle_availability: true },
          reports: { view_daily: true, view_analytics: true, export_data: true },
          staff_management: true
        }
      },
      { 
        id: 'STF-002', 
        name: 'فاطمة علي', 
        username: 'fatma.waiter', 
        phone: '+201009876543',
        role: 'waiter', 
        isActive: true,
        lastLogin: '2024-01-15 12:15',
        permissions: {
          orders: { view: true, update_status: true, cancel: false, refund: false },
          menu: { view: true, add_item: false, edit_item: false, delete_item: false, toggle_availability: true },
          reports: { view_daily: false, view_analytics: false, export_data: false },
          staff_management: false
        }
      },
      { 
        id: 'STF-003', 
        name: 'محمود حسن', 
        username: 'mahmoud.kitchen', 
        phone: '+201005555555',
        role: 'kitchen', 
        isActive: true,
        lastLogin: '2024-01-14 18:45',
        permissions: {
          orders: { view: true, update_status: true, cancel: false, refund: false },
          menu: { view: true, add_item: false, edit_item: false, delete_item: false, toggle_availability: false },
          reports: { view_daily: false, view_analytics: false, export_data: false },
          staff_management: false
        }
      },
      { 
        id: 'STF-004', 
        name: 'نور إبراهيم', 
        username: 'noor.manager', 
        phone: '+201007777777',
        role: 'manager', 
        isActive: false,
        lastLogin: '2024-01-10 09:20',
        permissions: {
          orders: { view: true, update_status: true, cancel: true, refund: false },
          menu: { view: true, add_item: true, edit_item: true, delete_item: false, toggle_availability: true },
          reports: { view_daily: true, view_analytics: true, export_data: false },
          staff_management: false
        }
      },
    ]
    setStaff(mockStaff)
  }

  // 🔹 فلترة البحث
  const filteredStaff = staff.filter(s =>
    s.name.includes(searchQuery) || 
    s.username.includes(searchQuery) ||
    s.phone.includes(searchQuery)
  )

  // 🔹 فتح نموذج الإضافة/التعديل
  const openModal = (staffItem = null) => {
    if (staffItem) {
      setEditingStaff(staffItem)
      setFormData({ ...staffItem })
    } else {
      setEditingStaff(null)
      setFormData({
        name: '',
        username: '',
        password: '',
        phone: '',
        role: 'waiter',
        isActive: true,
        permissions: {
          orders: { view: true, update_status: true, cancel: false, refund: false },
          menu: { view: true, add_item: false, edit_item: false, delete_item: false, toggle_availability: true },
          reports: { view_daily: false, view_analytics: false, export_data: false },
          staff_management: false
        }
      })
    }
    setShowModal(true)
  }

  // 🔹 تحديث صلاحية معينة
  const updatePermission = (module, action, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module],
          [action]: value
        }
      }
    }))
  }

  // 🔹 تطبيق دور جاهز (Admin/Manager/Waiter/Kitchen)
  const applyRolePreset = (role) => {
    const presets = {
      admin: {
        orders: { view: true, update_status: true, cancel: true, refund: true },
        menu: { view: true, add_item: true, edit_item: true, delete_item: true, toggle_availability: true },
        reports: { view_daily: true, view_analytics: true, export_data: true },
        staff_management: true
      },
      manager: {
        orders: { view: true, update_status: true, cancel: true, refund: false },
        menu: { view: true, add_item: true, edit_item: true, delete_item: false, toggle_availability: true },
        reports: { view_daily: true, view_analytics: true, export_data: false },
        staff_management: false
      },
      waiter: {
        orders: { view: true, update_status: true, cancel: false, refund: false },
        menu: { view: true, add_item: false, edit_item: false, delete_item: false, toggle_availability: true },
        reports: { view_daily: false, view_analytics: false, export_data: false },
        staff_management: false
      },
      kitchen: {
        orders: { view: true, update_status: true, cancel: false, refund: false },
        menu: { view: true, add_item: false, edit_item: false, delete_item: false, toggle_availability: false },
        reports: { view_daily: false, view_analytics: false, export_data: false },
        staff_management: false
      }
    }
    setFormData(prev => ({ ...prev, role, permissions: presets[role] }))
  }

  // 🔹 حفظ الموظف
  const handleSave = () => {
    if (!formData.name || !formData.username || !formData.password) {
      toast.error('⚠️ من فضلك أكمل البيانات المطلوبة')
      return
    }

    if (editingStaff) {
      // تعديل موظف موجود
      setStaff(prev => prev.map(s => 
        s.id === editingStaff.id ? { ...formData, id: editingStaff.id } : s
      ))
      toast.success('✅ تم تعديل بيانات الموظف')
    } else {
      // إضافة موظف جديد
      const newStaff = {
        ...formData,
        id: `STF-${String(staff.length + 1).padStart(3, '0')}`,
        lastLogin: 'لم يسجل دخول بعد'
      }
      setStaff(prev => [...prev, newStaff])
      toast.success('✅ تم إضافة الموظف بنجاح')
    }
    setShowModal(false)
  }

  // 🔹 حذف موظف
  const handleDelete = (staffId) => {
    if (window.confirm('⚠️ هل أنت متأكد من حذف هذا الموظف؟')) {
      setStaff(prev => prev.filter(s => s.id !== staffId))
      toast.success('🗑️ تم حذف الموظف')
    }
  }

  // 🔹 تبديل حالة التفعيل
  const toggleActive = (staffId) => {
    setStaff(prev => prev.map(s => 
      s.id === staffId ? { ...s, isActive: !s.isActive } : s
    ))
    toast.success('✅ تم تحديث حالة الموظف')
  }

  // 🔹 ألوان الأدوار
  const roleColors = {
    admin: 'bg-purple-500',
    manager: 'bg-blue-500',
    waiter: 'bg-green-500',
    kitchen: 'bg-orange-500'
  }

  const roleLabels = {
    admin: '👑 أدمن',
    manager: '📊 مدير',
    waiter: '🍽️ جرسون',
    kitchen: '👨‍🍳 مطبخ'
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-bg-dark text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-40 ${darkMode ? 'bg-bg-darker' : 'bg-white'} shadow-lg border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-white/10 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="font-bold text-lg">إدارة الموظفين</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-white/10 rounded-lg">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => openModal()} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              إضافة موظف
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl p-4 shadow`}>
            <p className="text-xs text-text-light mb-1">إجمالي الموظفين</p>
            <p className="text-2xl font-bold">{staff.length}</p>
          </div>
          <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl p-4 shadow`}>
            <p className="text-xs text-text-light mb-1">نشط الآن</p>
            <p className="text-2xl font-bold text-success">{staff.filter(s => s.isActive).length}</p>
          </div>
          <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl p-4 shadow`}>
            <p className="text-xs text-text-light mb-1">أدمن</p>
            <p className="text-2xl font-bold text-purple-400">{staff.filter(s => s.role === 'admin').length}</p>
          </div>
          <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl p-4 shadow`}>
            <p className="text-xs text-text-light mb-1">جرسون</p>
            <p className="text-2xl font-bold text-green-400">{staff.filter(s => s.role === 'waiter').length}</p>
          </div>
        </div>

        {/* بحث */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
          <input
            type="text"
            placeholder="ابحث باسم الموظف أو اليوزر أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-primary`}
          />
        </div>

        {/* قائمة الموظفين */}
        <div className="space-y-3">
          {filteredStaff.map((item) => (
            <div key={item.id} className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-4 border shadow`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${roleColors[item.role]} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold">{item.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      {item.name}
                      <span className={`px-2 py-0.5 rounded-full text-xs text-white ${roleColors[item.role]}`}>
                        {roleLabels[item.role]}
                      </span>
                      {!item.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500 text-white">غير نشط</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-text-light mt-1">
                      <span>👤 {item.username}</span>
                      <span>📱 {item.phone}</span>
                    </div>
                    <p className="text-xs text-text-light mt-1">آخر دخول: {item.lastLogin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleActive(item.id)} className={`p-2 rounded-lg ${item.isActive ? 'bg-success/20 text-success' : 'bg-gray-500/20 text-gray-400'} hover:opacity-80`}>
                    {item.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openModal(item)} className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-error/20 text-error hover:bg-error/30">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 🔹 Modal إضافة/تعديل موظف */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`${darkMode ? 'bg-bg-darker' : 'bg-white'} rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
            
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b ${darkMode ? 'border-white/10 bg-bg-darker' : 'border-gray-200 bg-white'}">
              <h2 className="font-bold text-lg">{editingStaff ? '✏️ تعديل موظف' : '➕ إضافة موظف جديد'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              
              {/* البيانات الأساسية */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-light mb-1">الاسم الكامل *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`} placeholder="أحمد محمد" />
                </div>
                <div>
                  <label className="block text-sm text-text-light mb-1">اسم المستخدم *</label>
                  <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`} placeholder="ahmed.waiter" />
                </div>
                <div>
                  <label className="block text-sm text-text-light mb-1">كلمة المرور {!editingStaff && '*'}</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary`} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-text-light mb-1">رقم الهاتف</label>
                  <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`} placeholder="+201xxxxxxxxx" />
                </div>
              </div>

              {/* اختيار الدور */}
              <div>
                <label className="block text-sm text-text-light mb-2">الدور / الصلاحية</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <button
                      key={role}
                      onClick={() => applyRolePreset(role)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${
                        formData.role === role 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : `${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-gray-200 hover:bg-gray-50'}`
                      }`}
                    >
                      <div className="text-lg mb-1">{label.split(' ')[0]}</div>
                      <div className="text-xs text-text-light">{label.split(' ').slice(1).join(' ')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* الصلاحيات التفصيلية */}
              <div className={`${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl p-4`}>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  الصلاحيات التفصيلية
                </h3>
                
                {/* صلاحيات الطلبات */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">📦 الطلبات</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(formData.permissions.orders).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={value} onChange={(e) => updatePermission('orders', key, e.target.checked)} className="rounded text-primary focus:ring-primary" />
                        <span className={darkMode ? 'text-text-light' : 'text-gray-600'}>
                          {key === 'view' ? 'عرض' : key === 'update_status' ? 'تحديث الحالة' : key === 'cancel' ? 'إلغاء' : 'مرتجع'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* صلاحيات المنيو */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">📦 المنيو</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {Object.entries(formData.permissions.menu).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={value} onChange={(e) => updatePermission('menu', key, e.target.checked)} className="rounded text-primary focus:ring-primary" />
                        <span className={darkMode ? 'text-text-light' : 'text-gray-600'}>
                          {key === 'view' ? 'عرض' : key === 'add_item' ? 'إضافة' : key === 'edit_item' ? 'تعديل' : key === 'delete_item' ? 'حذف' : 'توفر'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* صلاحيات التقارير */}
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">📊 التقارير</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(formData.permissions.reports).map(([key, value]) => (
                      <label key={key} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={value} onChange={(e) => updatePermission('reports', key, e.target.checked)} className="rounded text-primary focus:ring-primary" />
                        <span className={darkMode ? 'text-text-light' : 'text-gray-600'}>
                          {key === 'view_daily' ? 'يومي' : key === 'view_analytics' ? 'تحليلات' : 'تصدير'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* إدارة الموظفين */}
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.permissions.staff_management} onChange={(e) => updatePermission('staff_management', null, e.target.checked)} className="rounded text-primary focus:ring-primary" />
                  <span className={darkMode ? 'text-text-light' : 'text-gray-600'}>👥 إدارة الموظفين (أدمن فقط)</span>
                </label>
              </div>

              {/* حالة التفعيل */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 rounded text-primary focus:ring-primary" />
                <span className="text-sm">✅ حساب مفعل (يمكن تسجيل الدخول)</span>
              </label>

            </div>

            {/* Modal Footer */}
            <div className={`sticky bottom-0 p-4 border-t ${darkMode ? 'border-white/10 bg-bg-darker' : 'border-gray-200 bg-white'} flex justify-end gap-2`}>
              <button onClick={() => setShowModal(false)} className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}>
                إلغاء
              </button>
              <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                حفظ
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}