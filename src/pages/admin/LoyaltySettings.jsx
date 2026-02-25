import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift, ArrowLeft, Save, TrendingUp, DollarSign, Award } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoyaltySettings() {
  const [darkMode, setDarkMode] = useState(true)
  const [settings, setSettings] = useState({
    pointsPerPound: 0.1,      // نقطة لكل جنيه
    redemptionRate: 10,       // نقطة = كام جنيه (10 نقاط = 1 جنيه)
    minPointsForRedemption: 50, // أقل حد للاستخدام
    birthdayBonus: 20,        // نقاط عيد الميلاد
    tiers: {
      bronze: { minPoints: 0, discount: 0, name: 'برونزي' },
      silver: { minPoints: 500, discount: 5, name: 'فضي' },
      gold: { minPoints: 1500, discount: 10, name: 'ذهبي' },
    }
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSave = async () => {
    setIsLoading(true)
    setTimeout(() => {
      // ⚠️ هنا هتحفظ في Firebase لاحقاً
      // await updateDoc(doc(db, 'loyaltyRules', 'main'), settings)
      localStorage.setItem('loyaltySettings', JSON.stringify(settings))
      toast.success('✅ تم حفظ إعدادات الولاء')
      setIsLoading(false)
    }, 800)
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
              <Gift className="w-6 h-6 text-primary" />
              <h1 className="font-bold text-lg">إعدادات نظام الولاء</h1>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 hover:bg-white/10 rounded-lg">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        
        {/* كسب النقاط */}
        <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-4 border shadow`}>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            كسب النقاط
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-light mb-2">نقاط لكل جنيه واحد</label>
              <input
                type="number"
                step="0.01"
                value={settings.pointsPerPound}
                onChange={(e) => setSettings({...settings, pointsPerPound: parseFloat(e.target.value)})}
                className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              <p className="text-xs text-text-light mt-1">مثال: 0.1 = نقطة واحدة لكل 10 جنيه</p>
            </div>

            <div>
              <label className="block text-sm text-text-light mb-2">نقاط هدية عيد الميلاد</label>
              <input
                type="number"
                value={settings.birthdayBonus}
                onChange={(e) => setSettings({...settings, birthdayBonus: parseInt(e.target.value)})}
                className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
          </div>
        </div>

        {/* استرداد النقاط */}
        <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-4 border shadow`}>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            استرداد النقاط
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-text-light mb-2">عدد النقاط لكل جنيه خصم</label>
              <input
                type="number"
                value={settings.redemptionRate}
                onChange={(e) => setSettings({...settings, redemptionRate: parseInt(e.target.value)})}
                className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              <p className="text-xs text-text-light mt-1">مثال: 10 = كل 10 نقاط = 1 جنيه خصم</p>
            </div>

            <div>
              <label className="block text-sm text-text-light mb-2">أقل حد من النقاط للاستخدام</label>
              <input
                type="number"
                value={settings.minPointsForRedemption}
                onChange={(e) => setSettings({...settings, minPointsForRedemption: parseInt(e.target.value)})}
                className={`w-full ${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary`}
              />
            </div>
          </div>
        </div>

        {/* المستويات */}
        <div className={`${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-2xl p-4 border shadow`}>
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            مستويات العملاء
          </h2>
          
          <div className="space-y-4">
            {Object.entries(settings.tiers).map(([key, tier]) => (
              <div key={key} className={`${darkMode ? 'bg-white/5' : 'bg-gray-50'} rounded-xl p-3`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{tier.name}</span>
                  <span className="text-primary font-bold">{tier.discount}% خصم</span>
                </div>
                <input
                  type="number"
                  placeholder="أقل عدد نقاط"
                  value={tier.minPoints}
                  onChange={(e) => setSettings({
                    ...settings, 
                    tiers: {...settings.tiers, [key]: {...tier, minPoints: parseInt(e.target.value)}}
                  })}
                  className={`w-full ${darkMode ? 'bg-white/5' : 'bg-white'} rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* زر الحفظ */}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>

      </main>
    </div>
  )
}