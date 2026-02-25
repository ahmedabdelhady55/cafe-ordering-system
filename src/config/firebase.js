import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

// 🔥 بيانات مشروعك الحقيقية من Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyChusigqfiXEg8Ms4ShE4i11Hr1x0xAlY4",
  authDomain: "cafe-ordering-system-d68ed.firebaseapp.com",
  projectId: "cafe-ordering-system-d68ed",
  storageBucket: "cafe-ordering-system-d68ed.firebasestorage.app",
  messagingSenderId: "786252397806",
  appId: "1:786252397806:web:3b3f3d6b2622aa63a0c7ff",
  measurementId: "G-HY6F6S4CSP"
}

// تهيئة Firebase
const app = initializeApp(firebaseConfig)

// تهيئة الخدمات
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)


// Analytics (اختياري - للإحصائيات)
// ملاحظات: Analytics مش بيشتغل إلا في Production مش على localhost
let analytics = null
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app)
}

export default app