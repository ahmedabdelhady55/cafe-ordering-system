import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Search, Plus, Minus, X, Coffee, IceCream, GlassWater, Flame, Cake, ChevronLeft, ChevronRight, Gift, Percent } from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '../../config/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

// أيقونات الأقسام
const CATEGORY_ICONS = {
  'hot_drinks': Coffee,
  'cold_drinks': IceCream,
  'juices': GlassWater,
  'shisha': Flame,
  'desserts': Cake,
}

// 🔹 أيقونات البانرات (للتحويل من اسم النص إلى مكون)
const BANNER_ICONS = {
  'Gift': Gift,
  'Flame': Flame,
  'Percent': Percent,
  'Coffee': Coffee,
  'GlassWater': GlassWater,
}

// 🔹 دالة مساعدة لعرض الاسم (تتعامل مع string أو object)
const getNameText = (nameObj, fallback = 'عنصر') => {
  if (!nameObj) return fallback
  if (typeof nameObj === 'string') return nameObj
  if (typeof nameObj === 'object') {
    return nameObj.ar || nameObj.en || fallback
  }
  return fallback
}

// 🔹 دالة مساعدة لعرض الوصف
const getDescriptionText = (descObj) => {
  if (!descObj) return null
  if (typeof descObj === 'string') return descObj
  if (typeof descObj === 'object') {
    return descObj.ar || descObj.en || null
  }
  return null
}

export default function MenuPage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState('hot_drinks')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [tableNumber, setTableNumber] = useState(null)
  const [customer, setCustomer] = useState(null)
  
  // 🔹 حالة البانرات
  const [banners, setBanners] = useState([])
  const [currentBanner, setCurrentBanner] = useState(0)
  
  const navigate = useNavigate()

  // 🔹 تحميل البيانات + التحقق من العميل + البانرات
  useEffect(() => {
    // 1. قراءة رقم الطاولة
    const table = sessionStorage.getItem('currentTable')
    if (!table) {
      toast.error('⚠️ من فضلك اختر رقم الطاولة أولاً')
      navigate('/')
      return
    }
    setTableNumber(table)

    // 2. قراءة بيانات العميل
    const savedCustomer = sessionStorage.getItem('currentCustomer')
    if (savedCustomer) {
      const customerData = JSON.parse(savedCustomer)
      setCustomer(customerData)
      toast.success(`👋 أهلاً بك يا ${customerData.name}!`)
    }

    // 3. تحميل المنيو والبانرات (Firebase + Fallback)
    loadBanners()
    loadMenuData()
  }, [])

  // 🔹 تحميل البانرات من Firebase (مع Fallback لـ Mock Data)
  const loadBanners = async () => {
    try {
      const bannersRef = collection(db, 'banners')
      const q = query(bannersRef, where('active', '==', true))
      
      const querySnapshot = await getDocs(q)
      const bannersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      if (bannersData.length > 0) {
        setBanners(bannersData)
      } else {
        loadMockBanners()
      }
    } catch (error) {
      console.error('Error loading banners:', error)
      loadMockBanners() // Fallback
    }
  }

  // Mock Data للبانرات (Fallback)
  const loadMockBanners = () => {
    const mockBanners = [
      {
        id: '1',
        title: '🎉 خصم 20% على الشيشة',
        subtitle: 'من الساعة 8 لـ 11 مساءً',
        type: 'gradient',
        gradient: 'from-purple-600 to-pink-600',
        icon: 'Flame',
        active: true,
        link: '/menu?category=shisha'
      },
      {
        id: '2',
        title: '☕ قهوة + كنافة بـ 50 جنيه',
        subtitle: 'عرض لفترة محدودة',
        type: 'gradient',
        gradient: 'from-amber-600 to-orange-600',
        icon: 'Gift',
        active: true,
        link: ''
      },
      {
        id: '3',
        title: '🥭 عصير مانجو طبيعي 100%',
        subtitle: 'جديد في الصعيدي كافيه',
        type: 'gradient',
        gradient: 'from-yellow-500 to-amber-600',
        icon: 'GlassWater',
        active: true,
        link: ''
      },
    ]
    setBanners(mockBanners)
  }

  // 🔹 تغيير البانر تلقائياً كل 3 ثواني
  useEffect(() => {
    const activeBanners = banners.filter(b => b.active)
    if (activeBanners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % activeBanners.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [banners])

  // 🔹 فلترة المنتجات
  useEffect(() => {
    let result = products.filter(p => p.category === activeCategory && p.available !== false)
    
    if (searchQuery) {
      result = result.filter(p => {
        const name = getNameText(p.name, '').toLowerCase()
        return name.includes(searchQuery.toLowerCase())
      })
    }
    setFilteredProducts(result)
  }, [activeCategory, searchQuery, products])

  // 🔹 تحميل المنيو من Firebase (مع Fallback لـ Mock Data)
  const loadMenuData = async () => {
    try {
      const productsRef = collection(db, 'products')
      const q = query(productsRef, where('available', '==', true))
      
      const querySnapshot = await getDocs(q)
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      if (productsData.length > 0) {
        // استخراج الأقسام الفريدة من المنتجات
        const categoriesMap = new Map()
        productsData.forEach(product => {
          const catId = product.category
          if (catId && !categoriesMap.has(catId)) {
            categoriesMap.set(catId, {
              id: catId,
              name: { ar: getCategoryName(catId), en: catId },
              order: categoriesMap.size + 1
            })
          }
        })
        
        setCategories(Array.from(categoriesMap.values()))
        setProducts(productsData)
      } else {
        loadMockMenuData()
      }
    } catch (error) {
      console.error('Error loading menu:', error)
      loadMockMenuData() // Fallback
    }
    setIsLoading(false)
  }

  // دالة مساعدة لأسماء الأقسام
  const getCategoryName = (categoryId) => {
    const names = {
      'hot_drinks': 'مشروبات ساخنة',
      'cold_drinks': 'مشروبات باردة',
      'juices': 'عصائر',
      'shisha': 'شيشة',
      'desserts': 'حلويات'
    }
    return names[categoryId] || categoryId
  }

  // Mock Data للمنيو (Fallback)
  const loadMockMenuData = () => {
    const mockCategories = [
      { id: 'hot_drinks', name: { ar: 'مشروبات ساخنة', en: 'Hot Drinks' }, order: 1 },
      { id: 'cold_drinks', name: { ar: 'مشروبات باردة', en: 'Cold Drinks' }, order: 2 },
      { id: 'juices', name: { ar: 'عصائر', en: 'Juices' }, order: 3 },
      { id: 'shisha', name: { ar: 'شيشة', en: 'Shisha' }, order: 4 },
      { id: 'desserts', name: { ar: 'حلويات', en: 'Desserts' }, order: 5 },
    ]

    const mockProducts = [
      { id: 'p1', name: { ar: 'قهوة عربية', en: 'Arabic Coffee' }, category: 'hot_drinks', price: 15, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80', available: true, description: { ar: 'قهوة عربية أصيلة' } },
      { id: 'p2', name: { ar: 'شاي بالنعناع', en: 'Mint Tea' }, category: 'hot_drinks', price: 10, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&q=80', available: true, description: { ar: 'شاي مصري بالنعناع الطازج' } },
      { id: 'p3', name: { ar: 'كابوتشينو', en: 'Cappuccino' }, category: 'hot_drinks', price: 35, image: 'https://images.unsplash.com/photo-1572490122746-2691e297db58?w=400&q=80', available: true, description: { ar: 'كابوتشينو إيطالي كريمي' } },
      { id: 'p4', name: { ar: 'آيس تي', en: 'Ice Tea' }, category: 'cold_drinks', price: 25, image: 'https://images.unsplash.com/photo-1499411558661-2bd0bbd7da77?w=400&q=80', available: true, description: { ar: 'آيس تي منعش بنكهات متعددة' } },
      { id: 'p5', name: { ar: 'موهيتو', en: 'Mojito' }, category: 'cold_drinks', price: 40, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80', available: true, description: { ar: 'موهيتو كلاسيك بالنعناع والليمون' } },
      { id: 'p6', name: { ar: 'عصير برتقال', en: 'Orange Juice' }, category: 'juices', price: 20, image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80', available: true, description: { ar: 'عصير برتقال طازج يومياً' } },
      { id: 'p7', name: { ar: 'مانجو', en: 'Mango' }, category: 'juices', price: 35, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80', available: true, description: { ar: 'عصير مانجو طبيعي 100%' } },
      { id: 'p8', name: { ar: 'شيشة تفاح', en: 'Apple Shisha' }, category: 'shisha', price: 50, image: 'https://images.unsplash.com/photo-1534128211263-1c78e5d0c9d8?w=400&q=80', available: true, description: { ar: 'تفاح أحمر منعش' } },
      { id: 'p9', name: { ar: 'شيشة نعناع', en: 'Mint Shisha' }, category: 'shisha', price: 50, image: 'https://images.unsplash.com/photo-1534128211263-1c78e5d0c9d8?w=400&q=80', available: true, description: { ar: 'نعناع طازج ومريح' } },
      { id: 'p10', name: { ar: 'كنافة بالقشطة', en: 'Knafeh' }, category: 'desserts', price: 45, image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&q=80', available: true, description: { ar: 'كنافة نابلسية بالقشطة' } },
      { id: 'p11', name: { ar: 'بقلاوة', en: 'Baklava' }, category: 'desserts', price: 30, image: 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=400&q=80', available: true, description: { ar: 'بقلاوة تركية بالفستق' } },
    ]

    setCategories(mockCategories)
    setProducts(mockProducts)
  }

  // 🔹 إضافة منتج للسلة
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    const productName = getNameText(product.name, 'منتج')
    toast.success(`✅ ${productName} أضيف للسلة`, {
      icon: '🛒',
      duration: 1500,
    })
  }

  // 🔹 حساب إجمالي السلة
  const cartTotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0)
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)

  // 🔹 الانتقال للسلة
  const goToCart = () => {
    if (cartCount === 0) {
      toast.info('🛒 السلة فارغة، اختر بعض الأصناف أولاً!')
      return
    }
    sessionStorage.setItem('currentCart', JSON.stringify(cart))
    navigate('/cart')
  }

  // 🔹 Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">جاري تحميل المنيو ☕</p>
        </div>
      </div>
    )
  }

  const activeBanners = banners.filter(b => b.active)

  return (
    <div className="min-h-screen bg-bg-cream pb-24">
      
      {/* 🔹 Header ثابت */}
      <header className="sticky top-0 z-40 bg-bg-darker text-white shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* اسم الكافيه */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">☕</span>
            <span className="font-bold text-lg">الصعيدي كافيه</span>
          </div>
          
          {/* رقم الطاولة + اسم العميل */}
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 px-3 py-1 rounded-full text-sm hidden md:block">
              🪑 طاولة {tableNumber}
            </div>
            {customer && (
              <div className="bg-success/20 px-3 py-1 rounded-full text-sm">
                👋 {customer.name?.split(' ')[0] || 'عزيزي'}
              </div>
            )}
          </div>
        </div>

        {/* 🔍 شريط البحث */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              placeholder="ابحث عن صنف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-bg-cream/90 text-text-primary rounded-xl py-2.5 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 🔹 البانر الإعلاني المتحرك */}
      {activeBanners.length > 0 && (
        <div className="relative overflow-hidden bg-bg-darker">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentBanner * 100}%)` }}>
            {activeBanners.map((banner) => {
              const IconComponent = BANNER_ICONS[banner.icon] || Gift
              
              return (
                <div 
                  key={banner.id}
                  className={`w-full flex-shrink-0 bg-gradient-to-r ${banner.gradient || 'from-primary to-primary-dark'} p-4 text-white`}
                >
                  <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{banner.title || 'عرض خاص'}</h3>
                        <p className="text-sm opacity-90">{banner.subtitle || ''}</p>
                      </div>
                    </div>
                    {banner.link ? (
                      <button 
                        onClick={() => navigate(banner.link)}
                        className="bg-white text-primary px-4 py-2 rounded-full text-sm font-bold hover:bg-white/90 transition-colors"
                      >
                        اطلب الآن →
                      </button>
                    ) : (
                      <button className="bg-white text-primary px-4 py-2 rounded-full text-sm font-bold hover:bg-white/90 transition-colors">
                        اطلب الآن →
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* مؤشرات البانر */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentBanner ? 'bg-white w-6' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* أزرار التنقل */}
          {activeBanners.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentBanner((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCurrentBanner((prev) => (prev + 1) % activeBanners.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )}

      {/* 🔹 Tabs الأقسام */}
      <div className="sticky top-28 z-30 bg-bg-cream/95 backdrop-blur-sm border-b border-gray-200">
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Coffee
            const isActive = activeCategory === cat.id
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-white text-text-secondary hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{getNameText(cat.name, 'قسم')}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 🔹 قائمة المنتجات */}
      <main className="px-4 py-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">لا توجد أصناف في هذا القسم 😔</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAdd={() => addToCart(product)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 🔹 زر السلة العائم */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <button
            onClick={goToCart}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between transition-all duration-300 active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-error text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-right">
                <div className="text-xs opacity-90">إجمالي الطلب</div>
                <div className="text-lg">{cartTotal} جنيه</div>
              </span>
            </div>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">عرض السلة ←</span>
          </button>
        </div>
      )}

    </div>
  )
}

// 🎴 مكون بطاقة المنتج
function ProductCard({ product, onAdd }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  const productName = getNameText(product.name, 'منتج')
  const productDescription = getDescriptionText(product.description)
  const productPrice = product.price || 0
  const isAvailable = product.available !== false

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex gap-3 p-3">
      {/* صورة المنتج */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          src={product.image}
          alt={productName}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-error px-2 py-1 rounded">نفذت الكمية</span>
          </div>
        )}
      </div>

      {/* تفاصيل المنتج */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-text-primary text-lg">{productName}</h3>
          {productDescription && (
            <p className="text-text-secondary text-sm mt-0.5 line-clamp-2">{productDescription}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold text-lg">{productPrice} ج.م</span>
          
          <button
            onClick={onAdd}
            disabled={!isAvailable}
            className={`flex items-center gap-1 px-4 py-2 rounded-full font-medium transition-all ${
              isAvailable
                ? 'bg-primary text-white hover:bg-primary-dark active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            أضف
          </button>
        </div>
      </div>
    </div>
  )
}