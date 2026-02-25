import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Coffee, ArrowLeft, Gift } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WelcomePage() {
  const [tableNumber, setTableNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const navigate = useNavigate()

  // 🔹 التحقق من تسجيل العميل + قراءة QR
  useEffect(() => {
    // 1. التحقق من تسجيل العميل
    const savedCustomer = sessionStorage.getItem('currentCustomer')
    if (savedCustomer) {
      const customer = JSON.parse(savedCustomer)
      setIsRegistered(true)
      toast.success(`👋 مرحباً بك يا ${customer.name}!`)
    }

    // 2. قراءة رقم الطاولة من QR
    const urlParams = new URLSearchParams(window.location.search)
    const tableFromQR = urlParams.get('table')
    
    if (tableFromQR) {
      setTableNumber(tableFromQR)
      toast.success(`🎯 تم التعرف على الطاولة رقم ${tableFromQR}`)
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!tableNumber || tableNumber < 1 || tableNumber > 999) {
      toast.error('⚠️ من فضلك أدخل رقم طاولة صحيح (1-999)')
      return
    }

    setIsLoading(true)
    
    // حفظ رقم الطاولة
    sessionStorage.setItem('currentTable', tableNumber)
    
    // 🔹 التحقق: هل العميل مسجل؟
    const savedCustomer = sessionStorage.getItem('currentCustomer')
    
    if (!savedCustomer) {
      // عميل جديد → حفظ الطاولة مؤقتاً وتحويل للتسجيل
      sessionStorage.setItem('pendingTable', tableNumber)
      
      // ✅ تم التعديل: toast() بدل toast.info()
      toast('📝 سجل بياناتك عشان تكسب نقاط ولاء!', {
        icon: '📝',
        duration: 2000
      })
      
      // تأخير بسيط عشان التوست يظهر قبل التنقل
      setTimeout(() => {
        navigate('/register')
        setIsLoading(false)
      }, 500)
      return
    }
    
    // عميل مسجل → تحويل مباشر للمنيو
    setTimeout(() => {
      toast.success('✨ يلا بينا!')
      navigate('/menu')
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-bg-cream relative overflow-hidden">
      {/* خلفية ضبابية دافية */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1920&q=80)',
          filter: 'blur(8px)'
        }}
      />
      
      {/* Overlay بني شفاف */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-darker/60 via-bg-darker/40 to-bg-cream" />

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        
        {/* زر الرجوع */}
        {window.history.length > 1 && (
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-6 right-6 p-3 bg-bg-darker/80 rounded-full text-white hover:bg-primary transition-all duration-300 shadow-lg"
            aria-label="رجوع"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        {/* الشعار والأيقونة */}
        <div className="text-center mb-8 animate-fade-in">
          {/* أيقونة القهوة */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-bg-darker p-5 rounded-3xl shadow-2xl">
              <Coffee className="w-16 h-16 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          {/* اسم الكافيه */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-lg">
            الصعيدي كافيه ☕
          </h1>
          <p className="text-text-light text-lg md:text-xl">
            اطلب من مكانك.. وخلي الخدمة أسهل
          </p>
        </div>

        {/* 🔹 بطاقة ترحيب للعميل المسجل */}
        {isRegistered && (
          <div className="mb-6 bg-success/10 border border-success/30 rounded-2xl px-4 py-3 text-center max-w-md">
            <div className="flex items-center justify-center gap-2 text-success">
              <Gift className="w-5 h-5" />
              <span className="font-medium">أهلاً بك تاني! نقاطك جاهزة 🎁</span>
            </div>
          </div>
        )}

        {/* كارت إدخال رقم الطاولة */}
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
            
            {/* العنوان */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-text-primary mb-2">
                رقم طاولتك؟
              </h2>
              <p className="text-text-secondary text-sm">
                عشان نعرف نوصلك طلبك في المكان الصح
              </p>
            </div>

            {/* حقل الإدخال */}
            <div className="mb-6">
              <label htmlFor="tableNumber" className="sr-only">رقم الطاولة</label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">🪑</span>
                <input
                  id="tableNumber"
                  type="number"
                  min="1"
                  max="999"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="أدخل رقم الطاولة"
                  className="input-field text-center text-2xl font-bold py-4 pr-12"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
              {/* ملاحظة مساعدة */}
              <p className="text-xs text-text-secondary mt-2 text-center">
                💡 لو مسحت QR code، رقم الطاولة هيتحط أوتوماتيك
              </p>
            </div>

            {/* زر البدء */}
            <button
              type="submit"
              disabled={isLoading || !tableNumber}
              className={`btn-primary w-full flex items-center justify-center gap-2 text-lg ${
                isLoading || !tableNumber ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  {isRegistered ? 'ابدأ الطلب 🚀' : 'يلا نبدأ 🚀'}
                </>
              )}
            </button>

          </form>

          {/* روابط مساعدة */}
          <div className="mt-6 text-center space-y-3">
            <button 
              onClick={() => {
                setTableNumber('1')
                // ✅ تم التعديل: toast() بدل toast.info()
                toast('تم وضع رقم تجريبي: طاولة 1', {
                  icon: '🔍',
                  duration: 2000
                })
              }}
              className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
            >
              🔍 تجربة سريعة (طاولة 1)
            </button>
            
            {/* 🔹 رابط نظام الولاء */}
            <p className="text-text-secondary text-xs">
              جديد على الصعيدي كافيه؟ 
              <button 
                onClick={() => {
                  // ✅ تم التعديل: toast() بدل toast.info()
                  toast('🎁 سجل أول مرة واخلع 10 نقاط هدية!', {
                    icon: '🎁',
                    duration: 3000
                  })
                }}
                className="text-primary hover:underline mr-1 font-medium"
              >
                اعرف نظام الولاء
              </button>
            </p>
          </div>
        </div>

        {/* فوتر بسيط */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-text-light text-xs">
            © 2024 الصعيدي كافيه • جميع الحقوق محفوظة
          </p>
        </div>
      </div>

      {/* أنيميشن CSS */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}