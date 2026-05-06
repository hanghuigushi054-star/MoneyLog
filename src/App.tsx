import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  PieChart,
  ArrowRightLeft,
  Settings,
  Bell,
  Search,
  UserCircle,
  TrendingDown,
  TrendingUp,
  Plus,
  Wallet,
  Menu,
  X,
  Landmark,
  PiggyBank,
  Banknote,
  Calendar,
  Tag,
  FileText,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

// --- Formatters & Helpers ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value);
};

const getTodayFormatted = (separator = '.') => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${separator}${month}${separator}${day}`;
};

// --- Initial Mock Data ---
const initialPerformanceData = [
  { name: '1月', value: 4800000 },
  { name: '2月', value: 4850000 },
  { name: '3月', value: 4900000 },
  { name: '4月', value: 4920000 },
  { name: '5月', value: 5050000 },
  { name: '6月', value: 5080000 },
  { name: '7月', value: 5100000 },
];

const initialAccountsData = [
  { name: 'メイン口座', value: 1250000, color: '#6366f1', icon: Landmark, type: 'bank' },
  { name: '貯蓄用口座', value: 3800000, color: '#10b981', icon: PiggyBank, type: 'bank' },
  { name: 'お財布', value: 50000, color: '#f59e0b', icon: Wallet, type: 'cash' },
];

const initialTransactions = [
  { id: 1, date: '2026.05.01', description: '給与振込', source: 'メイン口座', category: '収入', amount: 350000, type: 'income' },
  { id: 2, date: '2026.05.02', description: '家賃', source: 'メイン口座', category: '固定費', amount: -85000, type: 'expense' },
  { id: 3, date: '2026.05.04', description: 'ATM引き出し', source: 'メイン口座 → お財布', category: '振替', amount: 30000, type: 'transfer' },
  { id: 4, date: getTodayFormatted('.'), description: '昼食', source: 'お財布', category: '食費', amount: -1200, type: 'expense' },
  { id: 5, date: getTodayFormatted('.'), description: 'コーヒー', source: 'お財布', category: '食費', amount: -450, type: 'expense' },
];

const goalsData = [
  { id: 1, name: 'ハワイ旅行', target: 300000, current: 150000, color: 'bg-violet-500', barColor: 'bg-violet-100' },
  { id: 2, name: '車検費用', target: 120000, current: 120000, color: 'bg-emerald-500', barColor: 'bg-emerald-100' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App Data States
  const [transactions, setTransactions] = useState(initialTransactions);
  const [accountsData, setAccountsData] = useState(initialAccountsData);
  const [performanceData, setPerformanceData] = useState(initialPerformanceData);

  // Form Modal States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordType, setRecordType] = useState<'expense' | 'income' | 'transfer'>('expense');
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: getTodayFormatted('-'),
    category: '食費',
    sourceAccount: 'お財布',
    destAccount: 'メイン口座'
  });

  // Calculations
  const totalBalance = accountsData.reduce((sum, acc) => sum + acc.value, 0);

  const todayChange = useMemo(() => {
    const todayStr = getTodayFormatted('.');
    const todaysTxs = transactions.filter(t => t.date === todayStr);
    return todaysTxs.reduce((sum, tx) => sum + (tx.type === 'transfer' ? 0 : tx.amount), 0);
  }, [transactions]);

  // Handlers
  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(formData.amount, 10);
    if (!parsedAmount || isNaN(parsedAmount)) return;

    const newTxId = Date.now();
    const formattedDate = formData.date.replace(/-/g, '.');
    
    const newTx: any = {
      id: newTxId,
      date: formattedDate,
      description: formData.description || (recordType === 'expense' ? '支出' : recordType === 'income' ? '収入' : '振替'),
      category: formData.category,
      type: recordType
    };

    if (recordType === 'expense') {
      newTx.amount = -parsedAmount;
      newTx.source = formData.sourceAccount;
      setAccountsData(prev => prev.map(acc => acc.name === formData.sourceAccount ? { ...acc, value: acc.value - parsedAmount } : acc));
    } else if (recordType === 'income') {
      newTx.amount = parsedAmount;
      newTx.source = formData.sourceAccount;
      setAccountsData(prev => prev.map(acc => acc.name === formData.sourceAccount ? { ...acc, value: acc.value + parsedAmount } : acc));
    } else if (recordType === 'transfer') {
      newTx.amount = parsedAmount;
      newTx.source = `${formData.sourceAccount} → ${formData.destAccount}`;
      setAccountsData(prev => prev.map(acc => {
        if (acc.name === formData.sourceAccount) return { ...acc, value: acc.value - parsedAmount };
        if (acc.name === formData.destAccount) return { ...acc, value: acc.value + parsedAmount };
        return acc;
      }));
    }

    setTransactions([newTx, ...transactions]);

    setPerformanceData(prev => {
      const newData = [...prev];
      const lastIndex = newData.length - 1;
      const change = recordType === 'transfer' ? 0 : (recordType === 'income' ? parsedAmount : -parsedAmount);
      newData[lastIndex] = { ...newData[lastIndex], value: newData[lastIndex].value + change };
      return newData;
    });

    setFormData({ ...formData, amount: '', description: '' });
    setIsRecordModalOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'ホーム', icon: LayoutDashboard },
    { id: 'accounts', label: '口座・財布', icon: Wallet },
    { id: 'transactions', label: '履歴', icon: ArrowRightLeft },
    { id: 'settings', label: '設定', icon: Settings },
  ];

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="h-screen bg-zinc-50 text-zinc-900 font-sans flex flex-col lg:overflow-hidden relative selection:bg-violet-200">
      
      {/* --- Desktop Navigation --- */}
      <nav className="hidden lg:flex h-20 px-8 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 items-center justify-between shrink-0 sticky top-0 z-10 w-full transition-all">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center shadow-md shadow-zinc-900/10">
              <Banknote className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-zinc-900">MoneyLog</span>
          </div>
          
          <div className="flex gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
                  activeTab === item.id 
                  ? 'bg-zinc-100 text-zinc-900 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4 flex-1 justify-end">
          <button 
            onClick={() => setIsRecordModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            記録する
          </button>
          
          <div className="h-8 w-px bg-zinc-200 mx-2"></div>
          
          <button className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center hover:bg-zinc-200 transition-colors shrink-0">
            <UserCircle className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
      </nav>

      {/* --- Mobile Header --- */}
      <nav className="lg:hidden h-16 px-5 bg-zinc-50/80 backdrop-blur-xl flex items-center justify-between shrink-0 sticky top-0 z-10 w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center">
            <Banknote className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-zinc-900">MoneyLog</span>
        </div>
        <button className="w-9 h-9 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm text-zinc-500">
          <UserCircle className="w-5 h-5" />
        </button>
      </nav>

      {/* --- Main Workspace --- */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto lg:overflow-hidden relative z-0 pb-28 lg:pb-8">
        <div className="max-w-[1280px] mx-auto h-full flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Panel: Summary */}
          <section className="lg:col-span-4 flex flex-col gap-6 lg:overflow-y-auto lg:pr-2 lg:pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* Dark Premium Balance Card */}
            <motion.div 
              initial="hidden" animate="visible" variants={fadeUpVariant}
              className="relative bg-zinc-900 rounded-[2rem] p-7 text-white shadow-xl overflow-hidden shrink-0"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600 rounded-full blur-[80px] opacity-40 mix-blend-screen pointer-events-none"></div>
              <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500 rounded-full blur-[70px] opacity-20 mix-blend-screen pointer-events-none"></div>
              
              <div className="relative z-10">
                <p className="text-zinc-400 text-sm font-medium mb-2 flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> 現在の総残高
                </p>
                
                <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
                  {formatCurrency(totalBalance)}
                </h2>

                <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-4 gap-4 items-center">
                  <div className={`p-2.5 rounded-xl ${todayChange >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {todayChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-300 font-medium mb-0.5">本日の増減</p>
                    <p className={`font-bold text-lg leading-none ${todayChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {todayChange > 0 ? '+' : ''}{formatCurrency(todayChange)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Accounts Bento Box */}
            <motion.div 
              initial="hidden" animate="visible" variants={fadeUpVariant} transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60 flex-1 flex flex-col shrink-0 min-h-[420px]"
            >
              <h3 className="text-zinc-800 font-extrabold mb-6 flex items-center justify-between">
                内訳グラフ
                <button className="text-zinc-400 hover:text-zinc-600">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </h3>
              
              <div className="flex justify-center items-center h-48 relative w-full mb-6 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={accountsData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={8}
                    >
                      {accountsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `¥${value.toLocaleString()}`}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                  <span className="text-xl font-black text-zinc-900">{Math.floor(totalBalance/10000)}<span className="text-sm font-bold text-zinc-500 ml-0.5">万</span></span>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mt-1">Total</span>
                </div>
              </div>

              <ul className="mt-auto flex flex-col gap-2">
                {accountsData.map((item, idx) => (
                  <motion.li 
                    whileHover={{ scale: 1.01 }}
                    key={idx} 
                    className="flex items-center justify-between p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-colors cursor-pointer border border-zinc-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: item.color }}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-zinc-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-zinc-900 font-mono tracking-tight">{formatCurrency(item.value)}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            
          </section>

          {/* Right Panel: Market & Transactions */}
          <section className="lg:col-span-8 flex flex-col gap-6 lg:gap-8 lg:overflow-y-auto lg:pr-2 lg:pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* Goals */}
            <motion.div 
               initial="hidden" animate="visible" variants={fadeUpVariant} transition={{ delay: 0.2 }}
               className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {goalsData.map((goal, idx) => {
                const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                return (
                  <div key={goal.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60 relative overflow-hidden group hover:border-zinc-300 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">目標</p>
                        <p className="text-zinc-900 font-extrabold text-lg">{goal.name}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-full ${goal.barColor} flex items-center justify-center`}>
                        <PiggyBank className={`w-5 h-5 ${goal.color.replace('bg-', 'text-')}`} />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-end mb-3">
                      <p className="text-2xl font-black text-zinc-900 font-mono">{percent}%</p>
                      <p className="text-xs font-medium text-zinc-400 mb-1">{formatCurrency(goal.target)}</p>
                    </div>
                    <div className={`h-2.5 w-full ${goal.barColor} rounded-full overflow-hidden`}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, delay: 0.5 + (idx * 0.2), ease: 'easeOut' }}
                        className={`h-full ${goal.color} rounded-full`} 
                      />
                    </div>
                  </div>
                )
              })}
            </motion.div>

            {/* Chart Room - Main Area */}
            <motion.div 
              initial="hidden" animate="visible" variants={fadeUpVariant} transition={{ delay: 0.3 }}
              className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-zinc-200/60 shrink-0"
            >
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h3 className="text-zinc-800 font-extrabold text-xl mb-1">資産推移</h3>
                  <p className="text-sm font-medium text-zinc-400">過去7ヶ月の動き</p>
                </div>
                <select className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl px-3 py-2 outline-none">
                  <option>半年</option>
                  <option>1年</option>
                  <option>全期間</option>
                </select>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e4e4e7" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }} 
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 600 }}
                      tickFormatter={(val) => `${(val / 10000)}万円`}
                      domain={['dataMin - 100000', 'auto']}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`¥${value.toLocaleString()}`, '総残高']}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      labelStyle={{ color: '#71717a', fontWeight: 'bold', marginBottom: '4px' }}
                      itemStyle={{ fontWeight: '900', color: '#18181b' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8b5cf6" 
                      strokeWidth={4}
                      dot={{ fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff', r: 5 }}
                      activeDot={{ r: 7, strokeWidth: 0, fill: '#6d28d9' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Transactions List */}
            <motion.div 
               initial="hidden" animate="visible" variants={fadeUpVariant} transition={{ delay: 0.4 }}
               className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60 flex-1 flex flex-col shrink-0"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-zinc-800 font-extrabold text-xl">最近の記録</h3>
                <button className="text-sm text-violet-600 font-bold hover:bg-violet-50 px-3 py-1.5 rounded-full transition-colors">
                  すべて見る
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                {transactions.map((tx) => (
                  <motion.div 
                    key={tx.id} 
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    className="flex items-center justify-between p-4 bg-white border border-zinc-100 hover:border-zinc-200 hover:shadow-sm rounded-2xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                          tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 
                          tx.type === 'expense' ? 'bg-rose-50 text-rose-500' :
                          'bg-indigo-50 text-indigo-500'
                      }`}>
                          {tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : 
                           tx.type === 'expense' ? <TrendingDown className="w-5 h-5" /> :
                           <ArrowRightLeft className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-zinc-900">{tx.description}</p>
                        <p className="text-xs font-semibold text-zinc-400 mt-1 flex items-center gap-1.5">
                          {tx.date} <span className="w-1 h-1 rounded-full bg-zinc-300"></span> {tx.source}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-black tracking-tight font-mono ${
                          tx.type === 'income' ? 'text-emerald-500' : 
                          tx.type === 'expense' ? 'text-zinc-900' :
                          'text-zinc-600'
                      }`}>
                          {tx.type === 'income' ? '+' : 
                           tx.type === 'expense' ? '-' : ''}
                          {formatCurrency(Math.abs(tx.amount))}
                      </p>
                      <span className="inline-block mt-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200 transition-colors">
                        {tx.category}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

          </section>
        </div>
      </main>

      {/* --- Mobile Bottom Nav & FAB --- */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-zinc-200 pb-safe z-40">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item, idx) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            // Middle empty space for floating button
            if (idx === 2) {
               return (
                  <React.Fragment key="fab-space">
                    <div className="w-16"></div> 
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${isActive ? 'text-violet-600' : 'text-zinc-400'}`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'fill-violet-100' : ''}`} />
                      <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                  </React.Fragment>
               )
            }
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${isActive ? 'text-violet-600' : 'text-zinc-400'}`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-violet-100' : ''}`} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            )
          })}
        </div>
        
        {/* Absolute FAB overlapping the nav */}
        <button 
          onClick={() => setIsRecordModalOpen(true)}
          className="absolute left-1/2 -top-6 -translate-x-1/2 w-14 h-14 bg-zinc-900 rounded-full shadow-xl shadow-zinc-900/20 text-white flex items-center justify-center hover:bg-zinc-800 active:scale-95 transition-all outline-[6px] outline-zinc-50"
        >
          <Plus className="w-6 h-6" />
        </button>
      </nav>

      {/* --- Record Transaction Modal / Bottom Sheet --- */}
      <AnimatePresence>
        {isRecordModalOpen && (
          <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center p-0 sm:p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRecordModalOpen(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ y: '100%', scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 0.95 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="relative bg-white w-full max-w-lg rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
            >
              
              {/* Drag Handle (Mobile) */}
              <div className="w-full flex justify-center pt-4 pb-2 sm:hidden bg-zinc-50">
                <div className="w-12 h-1.5 bg-zinc-300 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50 sm:pt-6">
                <h3 className="font-extrabold text-xl text-zinc-800">お金を記録</h3>
                <button 
                  onClick={() => setIsRecordModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-200/50 hover:bg-zinc-200 text-zinc-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="overflow-y-auto p-6 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <form id="recordForm" onSubmit={handleRecordSubmit} className="flex flex-col gap-6 w-full">
                  
                  {/* Smart Tabs */}
                  <div className="flex bg-zinc-100 p-1.5 rounded-2xl relative shadow-inner">
                    <button 
                      type="button" 
                      onClick={() => setRecordType('expense')} 
                      className="flex-1 py-2.5 text-sm font-black rounded-xl transition-all relative z-10 text-rose-500"
                    >
                      支出
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setRecordType('income')} 
                      className="flex-1 py-2.5 text-sm font-black rounded-xl transition-all relative z-10 text-emerald-500"
                    >
                      収入
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setRecordType('transfer')} 
                      className="flex-1 py-2.5 text-sm font-black rounded-xl transition-all relative z-10 text-indigo-500"
                    >
                      振替
                    </button>
                    
                    {/* Animated Tab Background Indicator */}
                    <motion.div 
                      layoutId="activeTabBadge"
                      className="absolute top-1.5 bottom-1.5 w-[calc(33.333%-4px)] bg-white rounded-xl shadow-sm border border-zinc-200/50 z-0"
                      initial={false}
                      animate={{
                        x: recordType === 'expense' ? 0 : recordType === 'income' ? '100%' : '200%'
                      }}
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                    />
                  </div>

                  {/* Calculator/Amount Input */}
                  <div className="py-6 px-4 bg-zinc-50 rounded-[2rem] border border-zinc-100 flex flex-col items-center">
                    <label className="text-zinc-400 text-xs font-bold tracking-widest uppercase mb-1">Amount</label>
                    <div className="flex items-center text-zinc-900 group">
                      <span className="text-3xl font-bold text-zinc-300 mr-1 mt-1 transition-colors group-focus-within:text-indigo-400">¥</span>
                      <input 
                        type="number" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0"
                        className="w-48 bg-transparent border-none outline-none text-center text-6xl font-black font-mono tracking-tighter placeholder-zinc-200 focus:ring-0 p-0"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="flex flex-col gap-3">
                    
                    {/* Date */}
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-zinc-200 focus-within:border-zinc-400 focus-within:ring-4 focus-within:ring-zinc-100 transition-all">
                      <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="flex-1 bg-transparent border-none outline-none font-bold text-zinc-800 pr-4 text-base"
                      />
                    </div>

                    {/* Account Selectors */}
                    {recordType !== 'transfer' ? (
                      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-zinc-200 focus-within:border-zinc-400 focus-within:ring-4 focus-within:ring-zinc-100 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <select 
                          value={formData.sourceAccount}
                          onChange={(e) => setFormData({...formData, sourceAccount: e.target.value})}
                          className="flex-1 bg-transparent border-none outline-none font-bold text-zinc-800 pr-4 text-base appearance-none truncate"
                        >
                          {accountsData.map(acc => <option key={acc.name} value={acc.name}>{acc.name} ({formatCurrency(acc.value)})</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="flex bg-white rounded-2xl border border-zinc-200 p-2 items-center relative gap-2">
                        <div className="flex-1 flex flex-col">
                           <span className="text-[10px] font-bold text-zinc-400 uppercase ml-2 mb-1">From</span>
                           <select 
                             value={formData.sourceAccount}
                             onChange={(e) => setFormData({...formData, sourceAccount: e.target.value})}
                             className="w-full bg-zinc-50 h-12 rounded-xl border-none outline-none font-bold text-zinc-800 px-3 text-sm appearance-none truncate"
                           >
                             {accountsData.map(acc => <option key={acc.name} value={acc.name}>{acc.name}</option>)}
                           </select>
                        </div>
                        
                        <div className="w-8 flex justify-center mt-4">
                           <ArrowRightLeft className="w-4 h-4 text-zinc-400" />
                        </div>

                        <div className="flex-1 flex flex-col">
                           <span className="text-[10px] font-bold text-zinc-400 uppercase ml-2 mb-1">To</span>
                           <select 
                             value={formData.destAccount}
                             onChange={(e) => setFormData({...formData, destAccount: e.target.value})}
                             className="w-full bg-zinc-50 h-12 rounded-xl border-none outline-none font-bold text-zinc-800 px-3 text-sm appearance-none truncate"
                           >
                             {accountsData.map(acc => <option key={acc.name} value={acc.name}>{acc.name}</option>)}
                           </select>
                        </div>
                      </div>
                    )}

                    {/* Category & Memo Grid */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 flex items-center gap-4 bg-white p-2 rounded-2xl border border-zinc-200 focus-within:border-zinc-400 focus-within:ring-4 focus-within:ring-zinc-100 transition-all">
                        <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                          <Tag className="w-5 h-5" />
                        </div>
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-transparent border-none outline-none font-bold text-zinc-800 pr-4 text-base appearance-none"
                        >
                          {recordType === 'expense' && (
                            <><option>食費</option><option>日用品</option><option>交通費</option><option>趣味・娯楽</option><option>交際費</option><option>固定費</option></>
                          )}
                          {recordType === 'income' && (<><option>給与</option><option>副業</option><option>お小遣い</option><option>臨時収入</option></>)}
                          {recordType === 'transfer' && <option>振替</option>}
                          <option>その他</option>
                        </select>
                      </div>
                    </div>

                    {/* Memo input */}
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-zinc-200 focus-within:border-zinc-400 focus-within:ring-4 focus-within:ring-zinc-100 transition-all">
                      <div className="w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="メモ（コンビニ、カフェなど）"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-transparent border-none outline-none font-bold text-zinc-800 placeholder-zinc-300 pr-4 text-base"
                      />
                    </div>

                  </div>
                </form>
              </div>

              {/* Action Button Footer */}
              <div className="p-6 bg-white border-t border-zinc-100 pb-safe">
                <button 
                  type="submit"
                  form="recordForm"
                  disabled={!formData.amount}
                  className="w-full h-16 bg-zinc-900 hover:bg-black disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xl transition-all shadow-xl shadow-zinc-900/20 disabled:shadow-none active:scale-[0.98]"
                >
                  {recordType === 'expense' ? '支出を記録' : recordType === 'income' ? '収入を記録' : '振替を記録'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
