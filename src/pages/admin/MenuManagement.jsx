import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Package, Plus, Edit, Trash2, ArrowLeft, Search, Image as ImageIcon,
  Save, X, Tag, CheckCircle, Eye, EyeOff, ChevronRight, Coffee
} from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '../../config/firebase'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where
} from 'firebase/firestore'

export default function MenuManagement() {
  const [view, setView] = useState('categories') // 'categories' | 'products'
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('category') // 'category' | 'product'
  const [editingItem, setEditingItem] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  // 🔹 تحميل البيانات من Firebase
  useEffect(() => {
    loadMenuData()
  }, [])

  const loadMenuData = async () => {
    try {
      setIsLoading(true)
      
      // تحميل الأقسام
      const categoriesRef = collection(db, 'categories')
      const categoriesSnapshot = await getDocs(categoriesRef)
      const categoriesData = categoriesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // تحميل المنتجات
      const productsRef = collection(db, 'products')
      const productsSnapshot = await getDocs(productsRef)
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // لو مفيش أقسام، نستخدم الأقسام الافتراضية
      if (categoriesData.length === 0) {
        const defaultCategories = [
          { id: 'hot_drinks', name: { ar: 'مشروبات ساخنة', en: 'Hot Drinks' }, color: 'from-orange-500 to-amber-600', visible: true, order: 1 },
          { id: 'cold_drinks', name: { ar: 'مشروبات باردة', en: 'Cold Drinks' }, color: 'from-cyan-500 to-blue-600', visible: true, order: 2 },
          { id: 'juices', name: { ar: 'عصائر', en: 'Juices' }, color: 'from-pink-500 to-rose-600', visible: true, order: 3 },
          { id: 'shisha', name: { ar: 'شيشة', en: 'Shisha' }, color: 'from-purple-500 to-violet-600', visible: true, order: 4 },
          { id: 'desserts', name: { ar: 'حلويات', en: 'Desserts' }, color: 'from-amber-500 to-yellow-600', visible: true, order: 5 },
        ]
        
        // إضافة الأقسام الافتراضية لـ Firebase
        for (const cat of defaultCategories) {
          await addDoc(categoriesRef, {
            ...cat,
            cafe_id: 'cafe_001',
            createdAt: new Date().toISOString()
          })
        }
        
        setCategories(defaultCategories)
      } else {
        setCategories(categoriesData)
      }
      
      setProducts(productsData)
      
    } catch (error) {
      console.error('Error loading menu:', error)
      toast.error('⚠️ حدث خطأ في تحميل البيانات')
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 فتح قسم (عرض منتجاته)
  const openCategory = (category) => {
    setSelectedCategory(category)
    setView('products')
  }

  // 🔹 الرجوع للأقسام
  const backToCategories = () => {
    setSelectedCategory(null)
    setView('categories')
  }

  // 🔹 فلترة المنتجات حسب القسم المحدد
  const filteredProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory.id)
    : products

  // 🔹 فلترة البحث
  const searchFiltered = filteredProducts.filter(p =>
    (p.name?.ar || p.name?.en || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 🔹 فتح مودال القسم
  const openCategoryModal = (category = null) => {
    setModalType('category')
    setEditingItem(category)
    setShowModal(true)
  }

  // 🔹 فتح مودال المنتج
  const openProductModal = (product = null) => {
    setModalType('product')
    setEditingItem(product)
    setShowModal(true)
  }

  // 🔹 حفظ القسم في Firebase
  const saveCategory = async () => {
    try {
      setIsLoading(true)
      
      if (editingItem) {
        // تعديل قسم موجود
        const categoryRef = doc(db, 'categories', editingItem.id)
        await updateDoc(categoryRef, editingItem)
        toast.success('✅ تم تعديل القسم')
      } else {
        // إضافة قسم جديد
        const categoriesRef = collection(db, 'categories')
        const newCategory = {
          name: { ar: 'قسم جديد', en: 'New Category' },
          color: 'from-gray-500 to-gray-600',
          visible: true,
          order: categories.length + 1,
          cafe_id: 'cafe_001',
          createdAt: new Date().toISOString()
        }
        const docRef = await addDoc(categoriesRef, newCategory)
        setCategories(prev => [...prev, { ...newCategory, id: docRef.id }])
        toast.success('✅ تم إضافة القسم')
      }
      
      setShowModal(false)
      await loadMenuData() // إعادة تحميل البيانات
      
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('⚠️ حدث خطأ في حفظ القسم')
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 حفظ المنتج في Firebase
  const saveProduct = async (formData) => {
    try {
      setIsLoading(true)
      
      if (editingItem) {
        // تعديل منتج موجود
        const productRef = doc(db, 'products', editingItem.id)
        await updateDoc(productRef, formData)
        toast.success('✅ تم تعديل المنتج')
      } else {
        // إضافة منتج جديد
        const productsRef = collection(db, 'products')
        const newProduct = {
          ...formData,
          cafe_id: 'cafe_001',
          available: true,
          createdAt: new Date().toISOString()
        }
        const docRef = await addDoc(productsRef, newProduct)
        setProducts(prev => [...prev, { ...newProduct, id: docRef.id }])
        toast.success('✅ تم إضافة المنتج')
      }
      
      setShowModal(false)
      await loadMenuData() // إعادة تحميل البيانات
      
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('⚠️ حدث خطأ في حفظ المنتج')
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 حذف من Firebase
  const handleDelete = async (type, id) => {
    if (!window.confirm('⚠️ هل أنت متأكد من الحذف؟')) return
    
    try {
      setIsLoading(true)
      
      if (type === 'category') {
        await deleteDoc(doc(db, 'categories', id))
        setCategories(prev => prev.filter(c => c.id !== id))
        toast.success('🗑️ تم حذف القسم')
      } else {
        await deleteDoc(doc(db, 'products', id))
        setProducts(prev => prev.filter(p => p.id !== id))
        toast.success('🗑️ تم حذف المنتج')
      }
      
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('⚠️ حدث خطأ في الحذف')
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 تبديل التوفر في Firebase
  const toggleAvailability = async (type, id) => {
    try {
      setIsLoading(true)
      
      if (type === 'category') {
        const category = categories.find(c => c.id === id)
        const categoryRef = doc(db, 'categories', id)
        await updateDoc(categoryRef, { visible: !category.visible })
        setCategories(prev => prev.map(c => c.id === id ? {...c, visible: !c.visible} : c))
      } else {
        const product = products.find(p => p.id === id)
        const productRef = doc(db, 'products', id)
        await updateDoc(productRef, { available: !product.available })
        setProducts(prev => prev.map(p => p.id === id ? {...p, available: !p.available} : p))
      }
      
      toast.success('✅ تم التحديث')
      
    } catch (error) {
      console.error('Error toggling availability:', error)
      toast.error('⚠️ حدث خطأ في التحديث')
    } finally {
      setIsLoading(false)
    }
  }

  // Loading State
  if (isLoading && categories.length === 0) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-bg-dark' : 'bg-gray-100'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className={darkMode ? 'text-text-light' : 'text-gray-600'}>جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-bg-dark text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-40 ${darkMode ? 'bg-bg-darker' : 'bg-white'} shadow-lg border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view === 'products' && (
              <button onClick={backToCategories} className="p-2 hover:bg-white/10 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              <h1 className="font-bold text-lg">
                {view === 'categories' ? 'إدارة الأقسام' : selectedCategory?.name?.ar || 'المنتجات'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-white/10 rounded-lg">
              {darkMode ? '☀️' : '🌙'}
            </button>
            {view === 'categories' ? (
              <button onClick={() => openCategoryModal()} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                قسم جديد
              </button>
            ) : (
              <button onClick={() => openProductModal()} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                صنف جديد
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        
        {/* 🔹 عرض الأقسام */}
        {view === 'categories' && (
          <>
            {/* بحث */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
              <input
                type="text"
                placeholder="ابحث عن قسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            {/* قائمة الأقسام */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories
                .filter(cat => cat.name?.ar?.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((cat) => {
                  const productCount = products.filter(p => p.category === cat.id).length
                  
                  return (
                    <div 
                      key={cat.id}
                      onClick={() => openCategory(cat)}
                      className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-4 border shadow-lg cursor-pointer hover:shadow-xl transition-all group`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                          <Coffee className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openCategoryModal(cat) }}
                            className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleAvailability('category', cat.id) }}
                            className={`p-2 rounded-lg ${cat.visible ? 'bg-success/20 text-success' : 'bg-gray-500/20 text-gray-400'}`}
                          >
                            {cat.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg mb-1">{cat.name?.ar || 'قسم'}</h3>
                      <p className="text-sm text-text-light mb-3">{cat.name?.en || 'Category'}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-light">{productCount} أصناف</span>
                        <ChevronRight className="w-5 h-5 text-text-light group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  )
                })}
            </div>
          </>
        )}

        {/* 🔹 عرض منتجات القسم */}
        {view === 'products' && selectedCategory && (
          <>
            {/* بحث */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
              <input
                type="text"
                placeholder="ابحث عن صنف في هذا القسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${darkMode ? 'bg-white/5' : 'bg-white'} rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>

            {/* قائمة المنتجات */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {searchFiltered.length === 0 ? (
                <div className={`col-span-full text-center py-12 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
                  <Package className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-text-light' : 'text-gray-400'}`} />
                  <p className={darkMode ? 'text-text-light' : 'text-gray-500'}>لا توجد أصناف في هذا القسم</p>
                  <button onClick={() => openProductModal()} className="btn-primary mt-4 text-sm">
                    أضف أول صنف
                  </button>
                </div>
              ) : (
                searchFiltered.map((product) => (
                  <div key={product.id} className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl p-4 border shadow`}>
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name?.ar || 'منتج'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-light">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold">{product.name?.ar || 'منتج'}</h3>
                          <div className="flex gap-1">
                            <button onClick={() => openProductModal(product)} className="p-1.5 rounded-lg bg-primary/20 text-primary">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete('product', product.id)} className="p-1.5 rounded-lg bg-error/20 text-error">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-primary font-bold mt-1">{product.price || 0} ج.م</p>
                        <button 
                          onClick={() => toggleAvailability('product', product.id)}
                          className={`mt-2 px-2 py-1 rounded-lg text-xs ${
                            product.available ? 'bg-success/20 text-success' : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {product.available ? '✅ متاح' : '❌ مخفي'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

      </main>

      {/* 🔹 Modal عام */}
      {showModal && (
        <ModalForm
          modalType={modalType}
          editingItem={editingItem}
          categories={categories}
          darkMode={darkMode}
          isLoading={isLoading}
          onClose={() => setShowModal(false)}
          onSave={modalType === 'category' ? saveCategory : saveProduct}
        />
      )}

    </div>
  )
}

// 📦 مكون النموذج (Modal)
function ModalForm({ modalType, editingItem, categories, darkMode, isLoading, onClose, onSave }) {
  const [formData, setFormData] = useState(editingItem || {})

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`${darkMode ? 'bg-bg-darker' : 'bg-white'} rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto`}>
        
        {/* Header */}
        <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${darkMode ? 'border-white/10 bg-bg-darker' : 'border-gray-200 bg-white'}`}>
          <h2 className="font-bold text-lg">
            {modalType === 'category' 
              ? (editingItem ? '✏️ تعديل قسم' : '➕ إضافة قسم جديد')
              : (editingItem ? '✏️ تعديل صنف' : '➕ إضافة صنف جديد')
            }
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Body */}
          <div className="p-4 space-y-4">
            {modalType === 'category' ? (
              // نموذج القسم
              <>
                <div>
                  <label className="block text-sm text-text-light mb-1">اسم القسم بالعربي</label>
                  <input 
                    type="text" 
                    value={formData.name?.ar || ''}
                    onChange={(e) => setFormData({...formData, name: {...formData.name, ar: e.target.value}})}
                    className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`} 
                    placeholder="مشروبات ساخنة"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-light mb-1">اسم القسم بالإنجليزي</label>
                  <input 
                    type="text" 
                    value={formData.name?.en || ''}
                    onChange={(e) => setFormData({...formData, name: {...formData.name, en: e.target.value}})}
                    className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`} 
                    placeholder="Hot Drinks"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-light mb-1">اللون</label>
                  <select 
                    value={formData.color || 'from-orange-500 to-amber-600'}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`}
                  >
                    <option value="from-orange-500 to-amber-600">برتقالي (مشروبات ساخنة)</option>
                    <option value="from-cyan-500 to-blue-600">أزرق (مشروبات باردة)</option>
                    <option value="from-pink-500 to-rose-600">وردي (عصائر)</option>
                    <option value="from-purple-500 to-violet-600">بنفسجي (شيشة)</option>
                    <option value="from-amber-500 to-yellow-600">أصفر (حلويات)</option>
                  </select>
                </div>
              </>
            ) : (
              // نموذج المنتج
              <>
                <div>
                  <label className="block text-sm text-text-light mb-1">اسم الصنف بالعربي *</label>
                  <input 
                    type="text" 
                    value={formData.name?.ar || ''}
                    onChange={(e) => setFormData({...formData, name: {...formData.name, ar: e.target.value}})}
                    className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`} 
                    placeholder="قهوة عربية"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-light mb-1">اسم الصنف بالإنجليزي</label>
                  <input 
                    type="text" 
                    value={formData.name?.en || ''}
                    onChange={(e) => setFormData({...formData, name: {...formData.name, en: e.target.value}})}
                    className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`} 
                    placeholder="Arabic Coffee"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-light mb-1">السعر (ج.م) *</label>
                    <input 
                      type="number" 
                      value={formData.price || ''}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`} 
                      placeholder="15"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-light mb-1">القسم</label>
                    <select 
                      value={formData.category || (categories[0]?.id || '')}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name?.ar || cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-text-light mb-1">رابط الصورة</label>
                  <input 
                    type="url" 
                    value={formData.image || ''}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary`} 
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-light mb-1">الوصف</label>
                  <textarea 
                    value={formData.description?.ar || ''}
                    onChange={(e) => setFormData({...formData, description: {...formData.description, ar: e.target.value}})}
                    className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none`} 
                    placeholder="وصف المنتج..."
                    rows="2"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className={`sticky bottom-0 p-4 border-t ${darkMode ? 'border-white/10 bg-bg-darker' : 'border-gray-200 bg-white'} flex justify-end gap-2`}>
            <button 
              type="button"
              onClick={onClose} 
              className={`px-4 py-2 rounded-xl ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              إلغاء
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}