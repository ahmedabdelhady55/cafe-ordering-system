import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChefHat, LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../config/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function StaffLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('⚠️ من فضلك أدخل البريد الإلكتروني وكلمة المرور')
      return
    }

    setIsLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      const staffRef = doc(db, 'staff', user.uid)
      const staffDoc = await getDoc(staffRef)

      if (staffDoc.exists()) {
        const staffData = staffDoc.data()

        if (!staffData.active) {
          await auth.signOut()
          toast.error('⚠️ حسابك غير مفعل')
          setIsLoading(false)
          return
        }

        sessionStorage.setItem('staffAuth', JSON.stringify({
          isLoggedIn: true,
          uid: user.uid,
          name: staffData.name,
          role: staffData.role,
          permissions: staffData.permissions
        }))

        toast.success(`✅ مرحباً بك يا ${staffData.name}!`)
        navigate('/staff/dashboard')
      }

    } catch (error) {
      console.error('Login error:', error)
      toast.error('⚠️ خطأ في تسجيل الدخول')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">تسجيل دخول الموظفين</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bg-cream rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bg-cream rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? 'جاري...' : <><LogIn className="w-5 h-5" /> تسجيل الدخول</>}
          </button>
        </form>
      </div>
    </div>
  )
}