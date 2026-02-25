import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ProtectedRoute({ children, requiredRole }) {
  const authData = sessionStorage.getItem('adminAuth')
  
  if (!authData) {
    toast.error('⚠️ من فضلك سجل الدخول أولاً')
    return <Navigate to="/admin/login" replace />
  }

  const { isLoggedIn, role } = JSON.parse(authData)

  if (!isLoggedIn) {
    toast.error('⚠️ من فضلك سجل الدخول أولاً')
    return <Navigate to="/admin/login" replace />
  }

  // التحقق من الصلاحية لو مطلوب
  if (requiredRole && role !== requiredRole && role !== 'admin') {
    toast.error('⚠️ ليس لديك صلاحية الوصول لهذه الصفحة')
    return <Navigate to="/admin" replace />
  }

  return children
}