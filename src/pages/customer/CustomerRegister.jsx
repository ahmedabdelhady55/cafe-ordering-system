import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, Phone, User, CheckCircle, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { db } from '../../config/firebase'
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore'

export default function CustomerRegister() {
  const [step, setStep] = useState(1) // 1: Phone, 2: Name, 3: Success
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [existingCustomer, setExistingCustomer] = useState(null)
  const navigate = useNavigate()

  // 🔹 التحقق من رقم الهاتف عند الدخول
  useEffect(() => {
    const savedCustomer = sessionStorage.getItem('currentCustomer')
    if (savedCustomer) {
      // عميل مسجل بالفعل
      const customer = JSON.parse(savedCustomer)
      toast.success(`👋 مرحباً بك يا ${customer.name}!`)
      navigate('/menu')
    }
  }, [])

  // 🔹 التحقق من وجود الرقم
  const checkPhone = async () => {
    if (!phone || phone.length < 11) {
      toast.error('⚠️ من فضلك أدخل رقم هاتف صحيح (11 رقم)')
      return
    }

    setIsLoading(true)

    try {
      // ⚠️ Firebase الحقيقي
      // const q = query(collection(db, 'customers'), where('phone', '==', phone))
      // const snapshot = await getDocs(q)
      // if (!snapshot.empty) {
      //   const customer = snapshot.docs[0].data()
      //   setExistingCustomer(customer)
      //   setStep(3) // عميل قديم
      //   return
      // }

      // 🎭 Mock للتجربة
      setTimeout(() => {
        setStep(2) // رقم جديد، نكمل التسجيل
        setIsLoading(false)
      }, 800)

    } catch (error) {
      console.error('Error checking phone:', error)
      toast.error('⚠️ حدث خطأ، حاول مرة أخرى')
      setIsLoading(false)
    }
  }

  // 🔹 إكمال التسجيل
  const completeRegistration = async () => {
    if (!name || name.length < 3) {
      toast.error('⚠️ من فضلك أدخل اسم صحيح')
      return
    }

    setIsLoading(true)

    try {
      // ⚠️ Firebase الحقيقي
      /*
      const customerRef = await addDoc(collection(db, 'customers'), {
        name,
        phone,
        loyaltyPoints: 10, // هدية التسجيل
        totalOrders: 0,
        registeredAt: new Date().toISOString(),
        lastVisit: new Date().toISOString(),
        whatsappOptIn: true
      })
      */

      // 🎭 Mock للتجربة
      setTimeout(() => {
        const customer = {
          id: 'CUST-' + Date.now(),
          name,
          phone,
          loyaltyPoints: 10,
          totalOrders: 0,
          registeredAt: new Date().toISOString(),
          whatsappOptIn: true
        }

        // حفظ في SessionStorage
        sessionStorage.setItem('currentCustomer', JSON.stringify(customer))

        toast.success('✅ تم التسجيل بنجاح! حصلت على 10 نقاط هدية 🎁')
        setStep(3)
        setIsLoading(false)

        // توجيه للمنيو بعد ثانية
        setTimeout(() => navigate('/menu'), 1500)
      }, 1000)

    } catch (error) {
      console.error('Error registering:', error)
      toast.error('⚠️ حدث خطأ في التسجيل')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* الشعار */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Coffee className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            الصعيدي كافيه ☕
          </h1>
          <p className="text-text-secondary">
            {step === 1 ? 'سجل عشان تكسب نقاط ولاء!' : 
             step === 2 ? 'كمل بياناتك يا ' + (name || 'غالي') : 
             'أهلاً بك في عيلتنا! 🎉'}
          </p>
        </div>

        {/* الكارت الرئيسي */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          
          {/* الخطوة 1: رقم الهاتف */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-bold text-lg text-text-primary">رقم هاتفك إيه؟</h2>
                <p className="text-sm text-text-secondary mt-1">
                  عشان نرسل لك عروض ونحفظ نقاطك
                </p>
              </div>

              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary">
                  +20
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="1xxxxxxxxx"
                  className="input-field pr-16 text-center text-lg font-bold"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && checkPhone()}
                />
              </div>

              <button
                onClick={checkPhone}
                disabled={isLoading || phone.length < 11}
                className={`btn-primary w-full ${isLoading || phone.length < 11 ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري التحقق...
                  </div>
                ) : (
                  'التالي ←'
                )}
              </button>

              <p className="text-xs text-center text-text-secondary">
                🔒 رقمك آمن عندنا، ومش هنستخدمه غير للعروض
              </p>
            </div>
          )}

          {/* الخطوة 2: الاسم */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-bold text-lg text-text-primary">اسمك إيه؟</h2>
                <p className="text-sm text-text-secondary mt-1">
                  عشان نناديك باسمك 😊
                </p>
              </div>

              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد محمد"
                  className="input-field pr-12 text-center text-lg"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && completeRegistration()}
                />
              </div>

              <div className="flex items-center gap-2 bg-primary/5 rounded-xl p-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <p className="text-sm text-text-primary">
                  🎁 هتاخد <span className="font-bold text-primary">10 نقاط هدية</span> فور التسجيل!
                </p>
              </div>

              <button
                onClick={completeRegistration}
                disabled={isLoading || name.length < 3}
                className={`btn-primary w-full ${isLoading || name.length < 3 ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جاري التسجيل...
                  </div>
                ) : (
                  'اكمل التسجيل ✓'
                )}
              </button>
            </div>
          )}

          {/* الخطوة 3: نجاح */}
          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h2 className="font-bold text-xl text-text-primary">
                {existingCustomer ? `مرحباً بك تاني يا ${existingCustomer.name}!` : 'تم التسجيل بنجاح!'}
              </h2>
              <p className="text-text-secondary">
                {existingCustomer ? `نقاطك الحالية: ${existingCustomer.loyaltyPoints} نقطة` : 'حصلت على 10 نقاط هدية!'}
              </p>
              <div className="flex items-center justify-center gap-2 text-primary font-medium">
                <span>جاري التحويل للمنيو...</span>
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            </div>
          )}

        </div>

        {/* رابط الرجوع */}
        {step === 1 && (
          <button
            onClick={() => navigate('/')}
            className="w-full text-center text-text-secondary hover:text-text-primary mt-4 text-sm"
          >
            ← الرجوع للصفحة الرئيسية
          </button>
        )}
      </div>
    </div>
  )
}