import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Image, ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff, 
  Calendar, Clock, Save, X, Upload, Palette, Flame,
  Gift, Percent, Coffee, Sparkles, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function BannerManagement() {
  const [banners, setBanners] = useState([])
  const [darkMode, setDarkMode] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [previewMode, setPreviewMode] = useState(false)
  const navigate = useNavigate()

  // 🔹 بيانات النموذج
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    type: 'gradient', // gradient | image
    gradient: 'from-purple-600 to-pink-600',
    image: '',
    icon: 'Gift',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    active: true,
    link: '' // رابط اختياري
  })

  // 🔹 تحميل البانرات
  useEffect(() => {
    loadBanners()
    
    // تشغيل فحص يومي للإعلانات المنتهية
    const interval = setInterval(checkExpiredBanners, 60000) // كل دقيقة
    return () => clearInterval(interval)
  }, [])

  const loadBanners = () => {
    // 🎭 Mock Data (هتتبدل بـ Firebase لاحقاً)
    const mockBanners = [
      {
        id: '1',
        title: '🎉 خصم 20% على الشيشة',
        subtitle: 'من الساعة 8 لـ 11 مساءً',
        type: 'gradient',
        gradient: 'from-purple-600 to-pink-600',
        icon: 'Flame',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        active: true,
        createdAt: '2024-01-01'
      },
      {
        id: '2',
        title: '☕ قهوة + كنافة بـ 50 جنيه',
        subtitle: 'عرض لفترة محدودة',
        type: 'gradient',
        gradient: 'from-amber-600 to-orange-600',
        icon: 'Gift',
        startDate: '2024-01-15',
        endDate: '2024-06-15',
        active: true,
        createdAt: '2024-01-15'
      },
    ]
    setBanners(mockBanners)
  }

  // 🔹 فحص البانرات المنتهية
  const checkExpiredBanners = () => {
    const today = new Date().toISOString().split('T')[0]
    const expiredCount = banners.filter(b => b.endDate && b.endDate < today && b.active).length
    
    if (expiredCount > 0) {
      setBanners(prev => prev.map(b => {
        if (b.endDate && b.endDate < today && b.active) {
          return { ...b, active: false }
        }
        return b
      }))
      toast.info(`📅 ${expiredCount} بانر انتهى وتم إيقافه تلقائياً`)
    }
  }

  // 🔹 فتح مودال الإضافة/التعديل
  const openModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner)
      setFormData({ ...banner })
    } else {
      setEditingBanner(null)
      setFormData({
        title: '',
        subtitle: '',
        type: 'gradient',
        gradient: 'from-purple-600 to-pink-600',
        image: '',
        icon: 'Gift',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        active: true,
        link: ''
      })
    }
    setShowModal(true)
  }

  // 🔹 حفظ البانر
  const saveBanner = () => {
    if (!formData.title || !formData.endDate) {
      toast.error('⚠️ العنوان وتاريخ الانتهاء مطلوبان')
      return
    }

    if (editingBanner) {
      // تعديل
      setBanners(prev => prev.map(b => 
        b.id === editingBanner.id 
          ? { ...formData, id: editingBanner.id, updatedAt: new Date().toISOString() }
          : b
      ))
      toast.success('✅ تم تعديل البانر')
    } else {
      // إضافة جديد
      const newBanner = {
        ...formData,
        id: 'banner_' + Date.now(),
        createdAt: new Date().toISOString()
      }
      setBanners(prev => [...prev, newBanner])
      toast.success('✅ تم إضافة البانر')
    }
    setShowModal(false)
  }

  // 🔹 حذف بانر
  const deleteBanner = (id) => {
    if (window.confirm('⚠️ هل أنت متأكد من حذف هذا البانر؟')) {
      setBanners(prev => prev.filter(b => b.id !== id))
      toast.success('🗑️ تم حذف البانر')
    }
  }

  // 🔹 تبديل الحالة
  const toggleActive = (id) => {
    setBanners(prev => prev.map(b => 
      b.id === id ? { ...b, active: !b.active } : b
    ))
    toast.success('✅ تم تحديث الحالة')
  }

  // 🔹 حساب الأيام المتبقية
  const getDaysRemaining = (endDate) => {
    if (!endDate) return null
    const today = new Date()
    const end = new Date(endDate)
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  // 🔹 الأيقونات المتاحة
  const icons = ['Gift', 'Flame', 'Percent', 'Coffee', 'Sparkles', 'TrendingUp']
  
  // 🔹 الألوان المتاحة
  const gradients = [
    'from-purple-600 to-pink-600',
    'from-amber-600 to-orange-600',
    'from-yellow-500 to-amber-600',
    'from-green-600 to-emerald-600',
    'from-blue-600 to-cyan-600',
    'from-red-600 to-rose-600',
    'from-indigo-600 to-purple-600',
  ]

  const IconComponent = (iconName) => {
    const icons = {
      Gift, Flame, Percent, Coffee, Sparkles, TrendingUp
    }
    return icons[iconName] || Gift
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
              <Image className="w-6 h-6 text-primary" />
              <h1 className="font-bold text-lg">إدارة البانرات الإعلانية</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-white/10 rounded-lg">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => openModal()} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              بانر جديد
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl p-4 shadow`}>
            <p className="text-xs text-text-light mb-1">إجمالي البانرات</p>
            <p className="text-2xl font-bold">{banners.length}</p>
          </div>
          <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl p-4 shadow`}>
            <p className="text-xs text-text-light mb-1">نشطة الآن</p>
            <p className="text-2xl font-bold text-success">{banners.filter(b => b.active).length}</p>
          </div>
          <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl p-4 shadow`}>
            <p className="text-xs text-text-light mb-1">منتهية</p>
            <p className="text-2xl font-bold text-error">{banners.filter(b => b.endDate && b.endDate < new Date().toISOString().split('T')[0]).length}</p>
          </div>
          <div className={`${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl p-4 shadow`}>
            <p className="text-xs text-text-light mb-1">ستنتهي قريباً</p>
            <p className="text-2xl font-bold text-warning">
              {banners.filter(b => {
                const days = getDaysRemaining(b.endDate)
                return days && days <= 7 && days > 0
              }).length}
            </p>
          </div>
        </div>

        {/* قائمة البانرات */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg">البانرات الحالية</h2>
          
          {banners.length === 0 ? (
            <div className={`text-center py-12 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
              <Image className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-text-light' : 'text-gray-400'}`} />
              <p className={darkMode ? 'text-text-light' : 'text-gray-500'}>لا توجد بانرات حالياً</p>
              <button onClick={() => openModal()} className="btn-primary mt-4 text-sm">
                أضف أول بانر
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {banners.map((banner) => {
                const daysRemaining = getDaysRemaining(banner.endDate)
                const Icon = IconComponent(banner.icon)
                
                return (
                  <div 
                    key={banner.id} 
                    className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-4 border shadow ${!banner.active ? 'opacity-50' : ''}`}
                  >
                    <div className="flex gap-4">
                      {/* معاينة البانر */}
                      <div className={`w-48 rounded-lg bg-gradient-to-r ${banner.gradient} p-3 text-white flex-shrink-0`}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-6 h-6" />
                          <div>
                            <p className="font-bold text-sm line-clamp-1">{banner.title}</p>
                            <p className="text-xs opacity-90 line-clamp-1">{banner.subtitle}</p>
                          </div>
                        </div>
                      </div>

                      {/* التفاصيل */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold">{banner.title}</h3>
                            <p className="text-sm text-text-light">{banner.subtitle}</p>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => toggleActive(banner.id)}
                              className={`p-2 rounded-lg ${banner.active ? 'bg-success/20 text-success' : 'bg-gray-500/20 text-gray-400'}`}
                            >
                              {banner.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button onClick={() => openModal(banner)} className="p-2 rounded-lg bg-primary/20 text-primary">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteBanner(banner.id)} className="p-2 rounded-lg bg-error/20 text-error">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-text-light">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>من: {banner.startDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>إلى: {banner.endDate}</span>
                          </div>
                          {daysRemaining !== null && (
                            <span className={`px-2 py-1 rounded-full ${
                              daysRemaining <= 0 ? 'bg-error/20 text-error' :
                              daysRemaining <= 7 ? 'bg-warning/20 text-warning' :
                              'bg-success/20 text-success'
                            }`}>
                              {daysRemaining <= 0 ? 'منتهي' : 
                               daysRemaining === 1 ? 'يوم واحد' : 
                               `${daysRemaining} يوم`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </main>

      {/* 🔹 Modal إضافة/تعديل */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`${darkMode ? 'bg-bg-darker' : 'bg-white'} rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl`}>
            
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}">
              <h2 className="font-bold text-lg">
                {editingBanner ? '✏️ تعديل بانر' : '➕ إضافة بانر جديد'}
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
                >
                  {previewMode ? 'إخفاء المعاينة' : 'معاينة'}
                </button>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              
              {/* معاينة مباشرة */}
              {previewMode && (
                <div className={`rounded-xl p-4 bg-gradient-to-r ${formData.gradient} text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        {(() => {
                          const Icon = IconComponent(formData.icon)
                          return <Icon className="w-6 h-6" />
                        })()}
                      </div>
                      <div>
                        <h3 className="font-bold">{formData.title || 'عنوان البانر'}</h3>
                        <p className="text-sm opacity-90">{formData.subtitle || 'وصف البانر'}</p>
                      </div>
                    </div>
                    <button className="bg-white text-primary px-4 py-2 rounded-full text-sm font-bold">
                      اطلب الآن →
                    </button>
                  </div>
                </div>
              )}

              {/* البيانات الأساسية */}
              <div>
                <label className="block text-sm text-text-light mb-1">العنوان *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="مثال: خصم 20% على الشيشة"
                />
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">الوصف</label>
                <input 
                  type="text" 
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="مثال: من الساعة 8 لـ 11 مساءً"
                />
              </div>

              {/* نوع البانر */}
              <div>
                <label className="block text-sm text-text-light mb-2">نوع الخلفية</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFormData({...formData, type: 'gradient'})}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2 ${
                      formData.type === 'gradient' ? 'border-primary bg-primary/10' : `${darkMode ? 'border-white/10' : 'border-gray-200'}`
                    }`}
                  >
                    <Palette className="w-5 h-5" />
                    لون متدرج
                  </button>
                  <button
                    onClick={() => setFormData({...formData, type: 'image'})}
                    className={`p-3 rounded-xl border-2 flex items-center gap-2 ${
                      formData.type === 'image' ? 'border-primary bg-primary/10' : `${darkMode ? 'border-white/10' : 'border-gray-200'}`
                    }`}
                  >
                    <Upload className="w-5 h-5" />
                    صورة
                  </button>
                </div>
              </div>

              {formData.type === 'gradient' ? (
                <>
                  {/* اختيار اللون */}
                  <div>
                    <label className="block text-sm text-text-light mb-2">اللون المتدرج</label>
                    <div className="flex gap-2 flex-wrap">
                      {gradients.map((gradient) => (
                        <button
                          key={gradient}
                          onClick={() => setFormData({...formData, gradient})}
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} ${
                            formData.gradient === gradient ? 'ring-2 ring-primary ring-offset-2' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* اختيار الأيقونة */}
                  <div>
                    <label className="block text-sm text-text-light mb-2">الأيقونة</label>
                    <div className="flex gap-2 flex-wrap">
                      {icons.map((icon) => {
                        const Icon = IconComponent(icon)
                        return (
                          <button
                            key={icon}
                            onClick={() => setFormData({...formData, icon})}
                            className={`p-3 rounded-xl border-2 ${
                              formData.icon === icon ? 'border-primary bg-primary/10' : `${darkMode ? 'border-white/10' : 'border-gray-200'}`
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm text-text-light mb-1">رابط الصورة</label>
                  <input 
                    type="url" 
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}

              {/* التواريخ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-light mb-1">تاريخ البدء *</label>
                  <input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-light mb-1">تاريخ الانتهاء *</label>
                  <input 
                    type="date" 
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`}
                  />
                </div>
              </div>

              {/* رابط اختياري */}
              <div>
                <label className="block text-sm text-text-light mb-1">رابط (اختياري)</label>
                <input 
                  type="text" 
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`}
                  placeholder="/menu?category=shisha"
                />
                <p className="text-xs text-text-light mt-1">لو عايز العميل يروح صفحة معينة لما يضغط على البانر</p>
              </div>

              {/* الحالة */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
                <span className="text-sm">✅ نشط (ظاهر للعملاء)</span>
              </label>

            </div>

            {/* Footer */}
            <div className={`sticky bottom-0 p-4 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'} flex justify-end gap-2`}>
              <button onClick={() => setShowModal(false)} className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                إلغاء
              </button>
              <button onClick={saveBanner} className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                حفظ البانر
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}