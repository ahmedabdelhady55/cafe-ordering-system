import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../config/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // 🔹 التحقق من تسجيل الدخول الحالي
  useEffect(() => {
    const savedAuth = sessionStorage.getItem('adminAuth')
    if (savedAuth) {
      const authData = JSON.parse(savedAuth)
      if (authData.isLoggedIn) {
        toast.success('✅ مرحباً بك!')
        navigate('/admin')
      }
    }
  }, [navigate])

  // 🔹 تسجيل الدخول
  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('⚠️ من فضلك أدخل البريد الإلكتروني وكلمة المرور')
      return
    }

    setIsLoading(true)

    try {
      // 🔐 تسجيل الدخول بـ Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // 👤 جلب بيانات الموظف من Firestore
      const staffRef = doc(db, 'staff', user.uid)
      const staffDoc = await getDoc(staffRef)

      if (staffDoc.exists()) {
        const staffData = staffDoc.data()

        // التحقق من أن الحساب مفعل
        if (!staffData.active) {
          await auth.signOut()
          toast.error('⚠️ حسابك غير مفعل، تواصل مع الإدارة')
          setIsLoading(false)
          return
        }

        // حفظ بيانات الموظف في SessionStorage
        const authData = {
          isLoggedIn: true,
          uid: user.uid,
          email: user.email,
          name: staffData.name,
          role: staffData.role,
          permissions: staffData.permissions,
          cafe_id: staffData.cafe_id,
          loginTime: new Date().toISOString()
        }

        sessionStorage.setItem('adminAuth', JSON.stringify(authData))

        toast.success(`✅ مرحباً بك يا ${staffData.name}!`)
        navigate('/admin')
      } else {
        // لو مفيش بيانات موظف، نستخدم بيانات أساسية
        const authData = {
          isLoggedIn: true,
          uid: user.uid,
          email: user.email,
          name: 'أدمن',
          role: 'admin',
          permissions: {
            orders: { view: true, update_status: true, cancel: true, refund: true },
            menu: { view: true, add_item: true, edit_item: true, delete_item: true },
            staff_management: true
          },
          cafe_id: 'cafe_001',
          loginTime: new Date().toISOString()
        }

        sessionStorage.setItem('adminAuth', JSON.stringify(authData))
        toast.success('✅ تم تسجيل الدخول بنجاح!')
        navigate('/admin')
      }

    } catch (error) {
      console.error('Login error:', error)
      
      let errorMessage = '⚠️ حدث خطأ في تسجيل الدخول'
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = '❌ كلمة المرور غير صحيحة'
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = '❌ البريد الإلكتروني غير مسجل'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = '⏳ تم تعليق الحساب مؤقتاً، حاول لاحقاً'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '❌ البريد الإلكتروني غير صحيح'
      }
      
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-cream flex items-center justify-center p-4">
      {/* خلفية */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1920&q=80)',
          filter: 'blur(8px)'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-bg-darker/50 to-bg-cream/50" />

      {/* المحتوى */}
      <div className="relative z-10 w-full max-w-md">
        
        {/* الشعار */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            الصعيدي كافيه ☕
          </h1>
          <p className="text-text-secondary">
            لوحة إدارة النظام
          </p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* البريد الإلكتروني */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cafe.com"
                className="w-full bg-bg-cream rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                disabled={isLoading}
              />
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-bg-cream rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* تنبيه */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                استخدم بيانات الأدمن المسجلة في Firebase. لو مفيش، سجل بياناتك أول مرة.
              </p>
            </div>

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary w-full flex items-center justify-center gap-2 text-lg ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  تسجيل الدخول
                </>
              )}
            </button>

          </form>

          {/* روابط مساعدة */}
          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setEmail('admin@cafe.com')
                setPassword('admin123')
                toast.info('تم ملء البيانات التجريبية')
              }}
              className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
            >
              🔍 استخدام بيانات تجريبية
            </button>
          </div>
        </div>

        {/* فوتر */}
        <div className="text-center mt-6">
          <p className="text-text-secondary text-sm">
            © 2024 الصعيدي كافيه • جميع الحقوق محفوظة
          </p>
        </div>

      </div>
    </div>
  )
}