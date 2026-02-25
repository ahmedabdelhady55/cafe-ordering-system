import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ShoppingBag, Clock, TrendingUp, Award, Bell, BellOff, 
  RefreshCw, Moon, Sun, Globe, LogOut, CheckCircle,
  AlertCircle, ChefHat, Users, Package, DollarSign, Gift, 
  Shield, ArrowLeft, Image
} from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '../../config/firebase'
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc,
  where,
  getDocs
} from 'firebase/firestore'

export default function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgPrepTime: '5 دقائق',
    mostOrdered: 'إسبريسو'
  })
  const [filterStatus, setFilterStatus] = useState('all')
  const [dateFilter, setDateFilter] = useState('today')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // 🔹 تحميل الطلبات Real-time من Firebase
  useEffect(() => {
    console.log('🔄 جاري الاتصال بـ Firebase...')
    
    try {
      const ordersRef = collection(db, 'orders')
      const q = query(ordersRef, orderBy('createdAt', 'desc'))
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('📦 تم استلام الطلبات:', snapshot.size)
          
          // دالة مساعدة لتحويل التاريخ
          const parseDate = (value) => {
            if (!value) return new Date()
            if (value.toDate && typeof value.toDate === 'function') {
              return value.toDate()
            }
            if (value instanceof Date) {
              return value
            }
            if (typeof value === 'string') {
              return new Date(value)
            }
            if (typeof value === 'number') {
              return new Date(value)
            }
            return new Date()
          }
          
          const ordersData = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              orderedAt: parseDate(data.timestamps?.ordered) || 
                         parseDate(data.createdAt) || 
                         new Date()
            }
          })
          
          setOrders(ordersData)
          
          // تشغيل صوت لو فيه طلب جديد
          const newOrders = ordersData.filter(o => o.status === 'new')
          if (newOrders.length > 0 && soundEnabled && ordersData.length > 0) {
            playNotificationSound()
            toast.success(`🔔 ${newOrders.length} طلب جديد!`)
          }
          
          calculateStats(ordersData)
          setIsLoading(false)
        },
        (error) => {
          console.error('❌ Error loading orders:', error)
          toast.error('⚠️ خطأ في الاتصال بـ Firebase')
          setIsLoading(false)
        }
      )
      
      return () => unsubscribe()
      
    } catch (error) {
      console.error('Error setting up listener:', error)
      setIsLoading(false)
    }
  }, [soundEnabled])

  // 🔹 فلترة الطلبات حسب الحالة + التاريخ
  useEffect(() => {
    let result = orders
    
    // فلترة حسب الحالة
    if (filterStatus !== 'all') {
      result = result.filter(o => o.status === filterStatus)
    }
    
    // فلترة حسب التاريخ
    const now = new Date()
    const today = now.toDateString()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    if (dateFilter === 'today') {
      result = result.filter(o => o.orderedAt.toDateString() === today)
    } else if (dateFilter === 'week') {
      result = result.filter(o => o.orderedAt >= weekAgo)
    } else if (dateFilter === 'month') {
      result = result.filter(o => o.orderedAt >= monthAgo)
    }
    
    setFilteredOrders(result)
  }, [filterStatus, dateFilter, orders])

  // 🔹 حساب الإحصائيات
  useEffect(() => {
    calculateStats(filteredOrders)
  }, [filteredOrders])

  // 🔹 حساب الإحصائيات
  const calculateStats = (ordersData) => {
    const totalOrders = ordersData.length
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0)
    
    setStats({
      totalOrders,
      totalRevenue,
      avgPrepTime: '5 دقائق',
      mostOrdered: 'إسبريسو'
    })
  }

  // 🔹 تشغيل صوت التنبيه
  const playNotificationSound = () => {
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3')
    audio.play().catch(() => {})
  }

  // 🔹 تغيير حالة الطلب
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId)
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      })
      
      const statusLabels = {
        'new': 'جديد',
        'preparing': 'جاري التحضير',
        'ready': 'جاهز',
        'paid': 'تم الدفع'
      }
      
      toast.success(`✅ تم تحديث الحالة إلى: ${statusLabels[newStatus]}`)
      
      if (soundEnabled) {
        const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3')
        audio.play().catch(() => {})
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('⚠️ حدث خطأ في تحديث الحالة')
    }
  }

  // 🔹 تسجيل الخروج
  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth')
    toast.success('👋 تم تسجيل الخروج')
    navigate('/admin/login')
  }

  // 🔹 Loading State
  if (isLoading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-bg-dark' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className={darkMode ? 'text-text-light' : 'text-gray-600'}>جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-bg-dark text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* 🔹 Header */}
      <header className={`sticky top-0 z-40 ${darkMode ? 'bg-bg-darker' : 'bg-white'} shadow-lg border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="px-4 py-3 flex items-center justify-between">
          {/* العنوان */}
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-primary" />
            <div>
              <h1 className="font-bold text-xl">لوحة التحكم</h1>
              <p className={`text-xs ${darkMode ? 'text-text-light' : 'text-text-secondary'}`}>
                {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* ✅ أزرار التحكم + الروابط */}
          <div className="flex items-center gap-1 md:gap-2">
            
            {/* 👥 إدارة العملاء */}
            <button
              onClick={() => navigate('/admin/customers')}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              title="إدارة العملاء"
            >
              <Users className="w-5 h-5" />
            </button>
            
            {/* 🎁 إعدادات الولاء */}
            <button
              onClick={() => navigate('/admin/loyalty')}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              title="إعدادات الولاء"
            >
              <Gift className="w-5 h-5" />
            </button>
            
            {/* 🛡️ إدارة الموظفين */}
            <button
              onClick={() => navigate('/admin/staff')}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              title="إدارة الموظفين"
            >
              <Shield className="w-5 h-5" />
            </button>
            
            {/* 📦 إدارة المنيو */}
            <button
              onClick={() => navigate('/admin/menu')}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              title="إدارة المنيو"
            >
              <Package className="w-5 h-5" />
            </button>
            
            {/* 📢 إدارة البانرات */}
            <button
              onClick={() => navigate('/admin/banners')}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              title="إدارة البانرات"
            >
              <Image className="w-5 h-5" />
            </button>
            
            {/* 🔔 الصوت */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              title={soundEnabled ? 'كتم الصوت' : 'تفعيل الصوت'}
            >
              {soundEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </button>
            
            {/* 🌙 الوضع الداكن */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              title={darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {/* 🌍 عرض الموقع */}
            <button
              onClick={() => navigate('/')}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
              title="عرض الموقع"
            >
              <Globe className="w-5 h-5" />
            </button>
            
            {/* 🚪 تسجيل الخروج */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-error/20 text-error hover:bg-error/30 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        
        {/* 🔹 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={ShoppingBag}
            label={`طلبات ${dateFilter === 'today' ? 'اليوم' : dateFilter === 'week' ? 'الأسبوع' : 'الشهر'}`}
            value={stats.totalOrders}
            color="from-blue-500 to-cyan-600"
            darkMode={darkMode}
          />
          <StatCard
            icon={DollarSign}
            label={`إيرادات ${dateFilter === 'today' ? 'اليوم' : dateFilter === 'week' ? 'الأسبوع' : 'الشهر'}`}
            value={`${stats.totalRevenue} ج.م`}
            color="from-green-500 to-emerald-600"
            darkMode={darkMode}
          />
          <StatCard
            icon={Clock}
            label="متوسط التحضير"
            value={stats.avgPrepTime}
            color="from-orange-500 to-amber-600"
            darkMode={darkMode}
          />
          <StatCard
            icon={Award}
            label="الأكثر طلباً"
            value={stats.mostOrdered}
            color="from-purple-500 to-violet-600"
            darkMode={darkMode}
          />
        </div>

        {/* 🔹 فلترة مزدوجة: التاريخ + الحالة */}
        <div className="space-y-3">
          {/* فلترة التاريخ */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className={`text-xs ${darkMode ? 'text-text-light' : 'text-gray-500'} whitespace-nowrap`}>فلترة حسب:</span>
            {[
              { id: 'today', label: '📅 اليوم' },
              { id: 'week', label: '📆 الأسبوع' },
              { id: 'month', label: '🗓️ الشهر' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setDateFilter(filter.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  dateFilter === filter.id
                    ? 'bg-primary text-white shadow-md'
                    : darkMode 
                      ? 'bg-white/10 text-text-light hover:bg-white/20'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* فلترة الحالة */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'كل الطلبات' },
                { id: 'new', label: 'جديدة' },
                { id: 'preparing', label: 'قيد التحضير' },
                { id: 'ready', label: 'جاهزة' },
                { id: 'paid', label: 'مدفوعة' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    filterStatus === filter.id
                      ? 'bg-primary text-white shadow-md'
                      : darkMode 
                        ? 'bg-white/10 text-text-light hover:bg-white/20'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setOrders([...orders])}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'} transition-colors`}
              title="تحديث"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 🔹 قائمة الطلبات */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-white'} shadow-md`}>
              <Package className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-text-light' : 'text-gray-400'}`} />
              <p className={darkMode ? 'text-text-light' : 'text-gray-500'}>
                لا توجد طلبات {filterStatus !== 'all' ? `بحالة "${filterStatus}"` : ''} {dateFilter !== 'today' ? `في فترة "${dateFilter}"` : ''}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
                darkMode={darkMode}
              />
            ))
          )}
        </div>

      </main>
    </div>
  )
}

// 📊 مكون بطاقة الإحصائيات
function StatCard({ icon: Icon, label, value, color, darkMode }) {
  return (
    <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-2xl p-4 shadow-md`}>
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className={`text-xs ${darkMode ? 'text-text-light' : 'text-gray-500'} mb-1`}>{label}</p>
      <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

// 📦 مكون بطاقة الطلب
function OrderCard({ order, onUpdateStatus, darkMode }) {
  const statusConfig = {
    'new': { label: 'جديد', color: 'bg-blue-500', icon: AlertCircle },
    'preparing': { label: 'جاري التحضير', color: 'bg-orange-500', icon: Clock },
    'ready': { label: 'جاهز', color: 'bg-success', icon: CheckCircle },
    'paid': { label: 'تم الدفع', color: 'bg-gray-500', icon: DollarSign },
  }

  const currentStatus = statusConfig[order.status]
  const StatusIcon = currentStatus.icon

  const getNextStatus = () => {
    const flow = { 'new': 'preparing', 'preparing': 'ready', 'ready': 'paid' }
    return flow[order.status] || null
  }

  return (
    <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-4 border shadow-md`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${currentStatus.color} flex items-center justify-center`}>
            <StatusIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">
              {order.id?.slice(-8).toUpperCase() || 'طلب'}
              {order.status === 'new' && <span className="ml-2 px-2 py-0.5 bg-error text-white text-xs rounded-full animate-pulse">جديد</span>}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-text-light' : 'text-gray-500'}`}>
              🪑 طاولة {order.tableId || 'غير محدد'} • {order.customerName || 'عميل زائر'}
              <br />
              ⏰ {order.orderedAt?.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) || 'منذ قليل'}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentStatus.color} text-white`}>
          {currentStatus.label}
        </span>
      </div>

      {/* قائمة الأصناف */}
      <div className={`space-y-2 mb-4 ${darkMode ? 'text-text-light' : 'text-gray-600'}`}>
        {order.items?.map((item, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span>{item.name?.ar || item.name?.en || 'منتج'} × {item.quantity || 1}</span>
            <span>{(item.price || 0) * (item.quantity || 1)} ج.م</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between pt-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div>
          <span className="text-lg font-bold text-primary">{order.total || 0} ج.م</span>
          {order.notes && (
            <p className={`text-xs mt-1 ${darkMode ? 'text-text-light' : 'text-gray-500'}`}>
              📝 {order.notes}
            </p>
          )}
        </div>
        
        {order.status !== 'paid' && (
          <button
            onClick={() => onUpdateStatus(order.id, getNextStatus())}
            className="btn-primary text-sm py-2 px-4"
          >
            {order.status === 'new' ? '🔥 بدء التحضير' : 
             order.status === 'preparing' ? '✅ جاهز للتسليم' : '💰 تأكيد الدفع'}
          </button>
        )}
      </div>
    </div>
  )
}