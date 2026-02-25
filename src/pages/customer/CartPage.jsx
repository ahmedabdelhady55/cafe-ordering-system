import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Plus, Minus, Gift, CreditCard, Banknote, Smartphone, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '../../config/firebase'
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  increment,
  query,
  where,
  getDocs
} from 'firebase/firestore'

export default function CartPage() {
  const [cart, setCart] = useState([])
  const [tableNumber, setTableNumber] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [usePoints, setUsePoints] = useState(false)
  const [userPoints, setUserPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [orderSummary, setOrderSummary] = useState(null)
  const navigate = useNavigate()

  // 🔹 تحميل البيانات عند الفتح
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const table = sessionStorage.getItem('currentTable')
      if (!table) {
        toast.error('⚠️ رقم الطاولة غير موجود')
        navigate('/')
        return
      }
      setTableNumber(table)

      const savedCart = sessionStorage.getItem('currentCart')
      if (!savedCart) {
        toast.error('🛒 السلة فارغة')
        navigate('/menu')
        return
      }
      setCart(JSON.parse(savedCart))

      const savedCustomer = sessionStorage.getItem('currentCustomer')
      if (savedCustomer) {
        const customerData = JSON.parse(savedCustomer)
        setCustomer(customerData)
        
        if (customerData.phone) {
          await loadCustomerPoints(customerData.phone)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('⚠️ حدث خطأ في تحميل البيانات')
    }
  }

  // 🔹 قراءة نقاط العميل من Firebase
  const loadCustomerPoints = async (phone) => {
    try {
      const customersRef = collection(db, 'customers')
      const q = query(customersRef, where('phone', '==', phone))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const customerData = snapshot.docs[0].data()
        setUserPoints(customerData.loyaltyPoints || 0)
      } else {
        const savedCustomer = sessionStorage.getItem('currentCustomer')
        if (savedCustomer) {
          const c = JSON.parse(savedCustomer)
          setUserPoints(c.loyaltyPoints || 10)
        }
      }
    } catch (error) {
      console.error('Error loading points:', error)
      const savedCustomer = sessionStorage.getItem('currentCustomer')
      if (savedCustomer) {
        const c = JSON.parse(savedCustomer)
        setUserPoints(c.loyaltyPoints || 10)
      }
    }
  }

  // 🔹 حسابات الأسعار
  const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0)
  const serviceFee = Math.round(subtotal * 0.1)
  const pointsDiscount = usePoints && userPoints >= 50 
    ? Math.min(Math.floor(userPoints / 10), subtotal)
    : 0
  const total = subtotal + serviceFee - pointsDiscount

  // 🔹 تعديل الكمية
  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.id === productId) {
          const newQty = (item.quantity || 1) + delta
          return { ...item, quantity: newQty > 0 ? newQty : 1 }
        }
        return item
      }).filter(item => (item.quantity || 1) > 0)
      
      sessionStorage.setItem('currentCart', JSON.stringify(updated))
      return updated
    })
  }

  // 🔹 حذف منتج
  const removeItem = (productId) => {
    setCart(prev => {
      const updated = prev.filter(item => item.id !== productId)
      sessionStorage.setItem('currentCart', JSON.stringify(updated))
      toast.success('🗑️ تم حذف الصنف')
      return updated
    })
  }

  // 🔹 إرسال الطلب لـ Firebase
  const submitOrder = async () => {
    if (cart.length === 0) {
      toast.error('🛒 السلة فارغة!')
      return
    }

    console.log('🔄 جاري إرسال الطلب...')
    setIsLoading(true)

    try {
      const orderData = {
        cafe_id: 'cafe_001',
        tableId: tableNumber || 'unknown',
        customerId: customer?.id || null,
        customerName: customer?.name || 'عميل زائر',
        customerPhone: customer?.phone || null,
        items: cart.map(item => ({
          productId: item.id || null,
          name: item.name || { ar: 'منتج', en: 'Product' },
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.image || '',
          category: item.category || ''
        })),
        subtotal: subtotal || 0,
        serviceFee: serviceFee || 0,
        pointsUsed: (usePoints && pointsDiscount > 0) ? (pointsDiscount * 10) : 0,
        pointsDiscount: pointsDiscount || 0,
        total: total || 0,
        paymentMethod: paymentMethod || 'cash',
        notes: notes || '',
        status: 'new',
        timestamps: {
          ordered: serverTimestamp()
        },
        createdAt: serverTimestamp()
      }

      console.log('📋 بيانات الطلب:', orderData)

      const ordersRef = collection(db, 'orders')
      const orderRef = await addDoc(ordersRef, orderData)
      
      console.log('✅ Order saved with ID:', orderRef.id)
      toast.success('🎉 تم إرسال طلبك بنجاح!')
      
      setOrderSummary({
        orderId: orderRef.id.slice(-6).toUpperCase(),
        estimatedTime: '5-10 دقائق',
        total: total || 0,
        paymentMethod,
        pointsEarned: Math.floor((total || 0) / 10)
      })

      sessionStorage.removeItem('currentCart')
      setCart([])

    } catch (error) {
      console.error('❌ Error submitting order:', error)
      console.error('❌ Error code:', error.code)
      console.error('❌ Error message:', error.message)
      
      let errorMessage = '⚠️ حدث خطأ أثناء إرسال الطلب'
      
      if (error.code === 'permission-denied') {
        errorMessage = '🔐 خطأ في الصلاحيات - تأكد من Firebase Security Rules'
      } else if (error.code === 'invalid-argument') {
        errorMessage = '❌ بيانات غير صحيحة - تأكد من البيانات المدخلة'
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // 🔹 تحديث نقاط العميل في Firebase
  const updateCustomerPoints = async (phone, pointsChange) => {
    try {
      const customersRef = collection(db, 'customers')
      const q = query(customersRef, where('phone', '==', phone))
      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        const customerDoc = snapshot.docs[0]
        await updateDoc(doc(db, 'customers', customerDoc.id), {
          loyaltyPoints: increment(pointsChange),
          lastVisit: serverTimestamp()
        })
        
        setUserPoints(prev => Math.max(0, prev + pointsChange))
      }
    } catch (error) {
      console.error('Error updating points:', error)
    }
  }

  // 🔹 تسجيل عميل جديد في Firebase
  const registerNewCustomer = async (customerData) => {
    try {
      const customersRef = collection(db, 'customers')
      const newCustomer = {
        name: customerData.name,
        phone: customerData.phone,
        loyaltyPoints: 10,
        totalOrders: 1,
        totalSpent: total,
        registeredAt: serverTimestamp(),
        lastVisit: serverTimestamp(),
        cafe_id: 'cafe_001'
      }
      
      const docRef = await addDoc(customersRef, newCustomer)
      
      const updatedCustomer = { ...customerData, id: docRef.id }
      sessionStorage.setItem('currentCustomer', JSON.stringify(updatedCustomer))
      setCustomer(updatedCustomer)
      
      console.log('✅ New customer registered:', docRef.id)
    } catch (error) {
      console.error('Error registering customer:', error)
    }
  }

  // 🔹 عرض تأكيد الطلب
  if (orderSummary) {
    return (
      <div className="min-h-screen bg-bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-2">
            تم استلام طلبك! 🎉
          </h2>
          <p className="text-text-secondary mb-6">
            رقم الطلب: <span className="font-mono font-bold text-primary">#{orderSummary.orderId}</span>
          </p>

          <div className="bg-bg-cream rounded-2xl p-4 mb-6 text-right">
            <div className="flex justify-between mb-2">
              <span className="text-text-secondary">الإجمالي</span>
              <span className="font-bold text-text-primary">{orderSummary.total} جنيه</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-text-secondary">طريقة الدفع</span>
              <span className="font-medium text-text-primary">
                {orderSummary.paymentMethod === 'cash' ? '💵 كاش' : 
                 orderSummary.paymentMethod === 'visa' ? '💳 فيزا' : '📱 محفظة رقمية'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">وقت التوصيل المتوقع</span>
              <span className="font-medium text-primary">{orderSummary.estimatedTime}</span>
            </div>
            {orderSummary.pointsEarned > 0 && (
              <div className="flex justify-between text-success mt-2 pt-2 border-t border-success/20">
                <span>نقاط مكتسبة</span>
                <span className="font-bold">+{orderSummary.pointsEarned} نقطة 🎁</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm text-text-secondary mb-3">متابعة حالة الطلب:</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">تم الاستلام ✓</span>
              <span className="text-text-secondary">→</span>
              <span className="text-text-secondary">جاري التحضير</span>
              <span className="text-text-secondary">→</span>
              <span className="text-text-secondary">جاهز</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/menu')}
              className="btn-primary w-full"
            >
              🛒 طلب إضافي
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 text-text-secondary hover:text-text-primary font-medium transition-colors"
            >
              الرجوع للرئيسية
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 🔹 واجهة السلة الرئيسية
  return (
    <div className="min-h-screen bg-bg-cream pb-32">
      
      {/* 🔹 Header */}
      <header className="sticky top-0 z-40 bg-bg-darker text-white shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg">سلة الطلبات 🛒</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="px-4 py-4 space-y-4">
        
        {/* 🔹 قائمة المنتجات */}
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-md p-4 flex gap-3">
              <img 
                src={item.image} 
                alt={item.name?.ar || item.name?.en || 'منتج'}
                className="w-16 h-16 rounded-xl object-cover bg-gray-100"
              />
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-text-primary">{item.name?.ar || item.name?.en || 'منتج'}</h3>
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="text-error hover:bg-error/10 p-1 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-primary font-bold mt-1">{item.price || 0} ج.م</p>
                
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 bg-bg-cream rounded-full p-1">
                    <button 
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow text-text-primary hover:bg-gray-100 transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-sm">{item.quantity || 1}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center bg-primary rounded-full shadow text-white hover:bg-primary-dark transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-text-secondary text-sm">
                    = {(item.price || 0) * (item.quantity || 1)} جنيه
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 🔹 ملاحظات الطلب */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <label className="block text-sm font-medium text-text-primary mb-2">
            📝 ملاحظات إضافية (اختياري)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: بدون سكر، زيادة ثلج، إلخ..."
            className="w-full bg-bg-cream rounded-xl p-3 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            rows="2"
          />
        </div>

        {/* 🔹 نظام الولاء */}
        {userPoints > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-amber-100 rounded-2xl p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                <span className="font-medium text-text-primary">نقاط الولاء</span>
              </div>
              <span className="text-primary font-bold">{userPoints} نقطة</span>
            </div>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={userPoints < 50}
              />
              <span className={`text-sm ${userPoints >= 50 ? 'text-text-primary' : 'text-text-secondary'}`}>
                استخدم نقاطي للخصم {userPoints >= 50 ? `(-${Math.min(Math.floor(userPoints/10), subtotal)} جنيه)` : '(تحتاج 50 نقطة على الأقل)'}
              </span>
            </label>
          </div>
        )}

        {/* 🔹 طريقة الدفع */}
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h3 className="font-bold text-text-primary mb-3">💳 طريقة الدفع</h3>
          <div className="space-y-2">
            {[
              { id: 'cash', label: 'دفع كاش عند التسليم', icon: Banknote },
              { id: 'visa', label: 'بطاقة ائتمان / فيزا', icon: CreditCard, disabled: true },
              { id: 'vodafone_cash', label: 'فودافون كاش', icon: Smartphone, disabled: true },
            ].map((method) => (
              <label 
                key={method.id}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === method.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200 hover:border-gray-300'
                } ${method.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-5 h-5 text-primary focus:ring-primary"
                  disabled={method.disabled}
                />
                <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-primary' : 'text-text-secondary'}`} />
                <span className="text-sm font-medium text-text-primary flex-1">{method.label}</span>
                {method.disabled && (
                  <span className="text-xs text-text-secondary bg-gray-100 px-2 py-1 rounded">قريباً</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* 🔹 ملخص الأسعار */}
        <div className="bg-bg-darker text-white rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-light">مجموع الأصناف</span>
            <span>{subtotal} جنيه</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-light">رسوم الخدمة (10%)</span>
            <span>+{serviceFee} جنيه</span>
          </div>
          {pointsDiscount > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>خصم النقاط</span>
              <span>-{pointsDiscount} جنيه</span>
            </div>
          )}
          <div className="border-t border-white/20 pt-2 mt-2 flex justify-between font-bold text-lg">
            <span>الإجمالي</span>
            <span className="text-primary">{total} جنيه</span>
          </div>
        </div>

        {/* 🔹 تنبيه مهم */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            بعد تأكيد الطلب، هيقدر الجرسون يشوفه فوراً على شاشة الإدارة. 
            الدفع هيكون عند استلام الطلب (ما لم تختار دفع إلكتروني).
          </p>
        </div>

      </main>

      {/* 🔹 زر تأكيد الطلب العائم */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <button
          onClick={submitOrder}
          disabled={isLoading || cart.length === 0}
          className={`btn-primary w-full flex items-center justify-center gap-2 text-lg ${
            isLoading || cart.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              جاري إرسال الطلب...
            </>
          ) : (
            <>
              ✅ تنفيذ الطلب ({total} جنيه)
            </>
          )}
        </button>
      </div>

    </div>
  )
}