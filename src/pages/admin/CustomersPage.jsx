import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, Phone, Mail, Gift, TrendingUp, Calendar, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const navigate = useNavigate()

  // 🔹 تحميل العملاء (Mock + sessionStorage)
  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = () => {
    // 1️⃣ Mock Data الأساسي
    const mockCustomers = [
      { id: 'U001', name: 'أحمد محمد', phone: '+201001234567', points: 150, totalOrders: 12, lastVisit: '2024-01-15', registeredAt: '2023-06-01' },
      { id: 'U002', name: 'فاطمة علي', phone: '+201009876543', points: 320, totalOrders: 25, lastVisit: '2024-01-14', registeredAt: '2023-08-15' },
      { id: 'U003', name: 'محمود حسن', phone: '+201005555555', points: 50, totalOrders: 5, lastVisit: '2024-01-10', registeredAt: '2023-12-01' },
    ]

    // 2️⃣ ✅ جديد: جلب العميل المسجل حديثاً من sessionStorage
    const registeredCustomer = sessionStorage.getItem('currentCustomer')
    if (registeredCustomer) {
      const customer = JSON.parse(registeredCustomer)
      const newCustomer = {
        id: customer.id || 'NEW-' + Date.now(),
        name: customer.name,
        phone: customer.phone,
        points: customer.loyaltyPoints || 10,
        totalOrders: customer.totalOrders || 0,
        lastVisit: new Date().toLocaleDateString('ar-EG'),
        registeredAt: customer.registeredAt || new Date().toLocaleDateString('ar-EG'),
        isNew: true // علامة عشان نميزه
      }
      // نضيفه لو مش موجود أصلاً
      if (!mockCustomers.find(c => c.phone === customer.phone)) {
        mockCustomers.unshift(newCustomer) // نضيفه في الأول
      }
    }

    setCustomers(mockCustomers)
  }

  // 🔹 فلترة البحث
  const filteredCustomers = customers.filter(c =>
    c.name.includes(searchQuery) || c.phone.includes(searchQuery)
  )

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
              <h1 className="font-bold text-lg">إدارة العملاء</h1>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-white/10 rounded-lg">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl p-4 shadow`}>
            <p className="text-xs text-text-light mb-1">إجمالي العملاء</p>
            <p className="text-2xl font-bold">{customers.length}</p>
          </div>
          <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl p-4 shadow`}>
            <p className="text-xs text-text-light mb-1">نقاط معلقة</p>
            <p className="text-2xl font-bold text-primary">{customers.reduce((sum, c) => sum + c.points, 0)}</p>
          </div>
          <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl p-4 shadow`}>
            <p className="text-xs text-text-light mb-1">متوسط الطلبات</p>
            <p className="text-2xl font-bold">{customers.length > 0 ? Math.round(customers.reduce((sum, c) => sum + c.totalOrders, 0) / customers.length) : 0}</p>
          </div>
          <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl p-4 shadow`}>
            <p className="text-xs text-text-light mb-1">أعلى عميل</p>
            <p className="text-lg font-bold truncate">{customers.sort((a,b) => b.points - a.points)[0]?.name || '-'}</p>
          </div>
        </div>

        {/* بحث */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
          <input
            type="text"
            placeholder="ابحث باسم العميل أو رقم الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-primary`}
          />
        </div>

        {/* قائمة العملاء */}
        <div className="space-y-3">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-4 border shadow ${customer.isNew ? 'ring-2 ring-primary' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">{customer.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      {customer.name}
                      {customer.isNew && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-success text-white">جديد ✨</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-text-light mt-1">
                      <Phone className="w-3 h-3" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 text-primary font-bold">
                    <Gift className="w-4 h-4" />
                    <span>{customer.points} نقطة</span>
                  </div>
                  <p className="text-xs text-text-light mt-1">{customer.totalOrders} طلب</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-3 pt-3 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}">
                <div className="flex items-center gap-1 text-xs text-text-light">
                  <Calendar className="w-3 h-3" />
                  <span>آخر زيارة: {customer.lastVisit}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-text-light">
                  <TrendingUp className="w-3 h-3" />
                  <span>مسجل منذ: {customer.registeredAt}</span>
                </div>
              </div>
            </div>
          ))}
          
          {filteredCustomers.length === 0 && (
            <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
              <Users className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-text-light' : 'text-gray-400'}`} />
              <p className={darkMode ? 'text-text-light' : 'text-gray-500'}>لا توجد عملاء 😔</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}