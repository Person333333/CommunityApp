import { useState, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ShieldCheck, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { mockCauses } from './Donations';

export default function CheckoutPage() {
  const [amount, setAmount] = useState<number | ''>(50);
  const [customAmount, setCustomAmount] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [email, setEmail] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const causeId = queryParams.get('cause');
  const cause = mockCauses.find(c => c.id === causeId) || mockCauses[0];

  const handleAmountClick = (val: number) => {
    setAmount(val);
    setCustomAmount(false);
    setError('');
  };

  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return val;
    }
  };

  const formatExpiry = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)} / ${v.substring(2, 4)}`;
    }
    return v;
  };

  const validateCard = () => {
    if (cardNumber.replace(/\s/g, '').length < 15) return "Invalid card number.";
    const [month, year] = cardExpiry.split(' / ');
    if (!month || !year || parseInt(month) > 12 || parseInt(month) < 1 || year.length < 2) return "Invalid expiration date.";
    if (cardCvc.length < 3) return "Invalid CVC.";
    if (cardName.trim().split(' ').length < 2) return "Please enter your full name on the card.";
    return null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!amount || amount < 1) {
      setError("Please select a valid donation amount.");
      return;
    }
    
    const validationError = validateCard();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate secure network transaction
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);

    }, 2500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="glass-layer p-12 rounded-[2.5rem] max-w-lg w-full text-center border border-emerald-500/30 shadow-[0_0_80px_rgba(16,185,129,0.15)] relative overflow-hidden z-10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          >
            <CheckCircle2 className="w-12 h-12" />
          </motion.div>
          
          <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Payment Successful!</h2>
          <p className="text-slate-300 mb-8 text-lg leading-relaxed">
            Your secure donation of <strong className="text-emerald-400 font-black">${amount}</strong> to <br/><strong className="text-white">{cause.title}</strong> has been processed. A receipt has been sent to {email}.
          </p>
          
          <button 
            onClick={() => navigate('/donations')}
            className="bg-emerald-500 text-black font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-emerald-400 transition-all active:scale-95 w-full shadow-lg shadow-emerald-500/20"
          >
            Return to Causes
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <button 
          onClick={() => navigate('/donations')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Causes
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Form Details */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">Secure Checkout</h1>
              <p className="text-emerald-400 font-bold mb-8 flex items-center gap-2 text-sm uppercase tracking-widest">
                <Lock className="w-4 h-4" /> TLS 1.3 256-bit Encryption
              </p>

              <div className="glass-layer p-8 rounded-[2rem] border border-white/10 mb-8 bg-slate-900/60 shadow-xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">You are supporting</h3>
                
                <div className="flex items-center gap-4 mb-4">
                  {cause.image ? (
                     <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                       <img src={cause.image} alt={cause.title} className="w-full h-full object-cover" />
                     </div>
                  ) : null}
                  <div>
                    <h2 className="text-2xl font-black text-white leading-tight">{cause.title}</h2>
                    <span className={`text-xs font-bold uppercase tracking-widest
                        ${cause.color === 'emerald' ? 'text-emerald-400' : 
                          cause.color === 'blue' ? 'text-blue-400' : 
                          cause.color === 'purple' ? 'text-purple-400' : 
                          cause.color === 'rose' ? 'text-rose-400' : 'text-indigo-400'}
                     `}>{cause.category}</span>
                  </div>
                </div>

                <p className="text-slate-400 text-sm mb-6 leading-relaxed hidden sm:block">{cause.description}</p>
                
                <div className="flex items-center gap-2 text-xs font-bold bg-emerald-500/10 text-emerald-400 w-fit px-4 py-2 rounded-lg border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4" /> Verified Nonprofit Organization
                </div>
              </div>

              {/* Amount Selection */}
              <div className="mb-8">
                <h3 className="text-white font-black text-lg mb-4">Select Gift Amount</h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {[25, 50, 100, 250, 500].map(val => (
                    <button
                      key={val}
                      onClick={() => handleAmountClick(val)}
                      className={`py-3.5 rounded-xl font-black transition-all ${!customAmount && amount === val 
                        ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-400' 
                        : 'glass-layer text-slate-300 hover:bg-white/10 border border-white/5'}`}
                    >
                      ${val}
                    </button>
                  ))}
                  <button
                    onClick={() => { setCustomAmount(true); setAmount(''); setError(''); }}
                    className={`py-3.5 rounded-xl font-bold transition-all ${customAmount 
                        ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] border-emerald-400' 
                        : 'glass-layer text-slate-300 hover:bg-white/10 border border-white/5'}`}
                  >
                    Custom
                  </button>
                </div>
                
                <AnimatePresence>
                  {customAmount && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative mt-4"
                    >
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-black text-xl">$</span>
                      <input 
                        type="number" 
                        min="1"
                        value={amount}
                        onChange={(e) => { setAmount(Number(e.target.value) || ''); setError(''); }}
                        placeholder="Custom amount"
                        className="w-full bg-slate-900 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] rounded-xl py-4 pl-10 pr-4 text-white font-black text-lg focus:outline-none focus:border-emerald-400 transition-colors"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
          </div>

          {/* Right Column: Payment Form */}
          <div className="lg:col-span-7">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-layer p-8 md:p-10 rounded-[2.5rem] border border-white/10 bg-slate-900/80 backdrop-blur-xl relative shadow-2xl"
              >
                  <h3 className="text-2xl font-black text-white mb-8 flex items-center justify-between">
                    <span className="flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-emerald-400" /> Payment Details
                    </span>
                    <div className="flex gap-2 opacity-50">
                        {/* Mock Card Brand Icons using CSS circles for aesthetic representation */}
                        <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-red-500 rounded flex items-center justify-center text-[8px] font-black text-white">VISA</div>
                        <div className="w-8 h-5 bg-gradient-to-r from-orange-400 to-red-500 rounded flex gap-1 items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-red-600 mix-blend-multiply -mr-2" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400 mix-blend-multiply" />
                        </div>
                    </div>
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address for Receipt</label>
                      <input 
                        required 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium" 
                      />
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Card Information</label>
                      <div className="relative shadow-inner">
                        <div className="absolute left-4 top-4 text-slate-500">
                             <CreditCard className="w-5 h-5" />
                        </div>
                        <input 
                            required 
                            type="text" 
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="0000 0000 0000 0000" 
                            className="w-full bg-black/40 border border-white/10 rounded-t-xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:z-10 relative transition-all font-mono text-lg tracking-wider" 
                        />
                        <div className="flex">
                            <input 
                                required 
                                type="text" 
                                maxLength={7}
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                placeholder="MM / YY" 
                                className="w-1/2 bg-black/40 border-b border-l border-white/10 rounded-bl-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:z-10 relative transition-all border-t-0 font-mono text-lg" 
                            />
                            <input 
                                required 
                                type="text" 
                                maxLength={4}
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                                placeholder="CVC" 
                                className="w-1/2 bg-black/40 border-b border-l border-r border-white/10 rounded-br-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:z-10 relative transition-all border-t-0 font-mono text-lg" 
                            />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Name on card</label>
                      <input 
                        required 
                        type="text" 
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="John Doe" 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium uppercase tracking-wide" 
                      />
                    </div>
                    
                    <div className="pt-6 mt-8 border-t border-white/10 flex justify-between items-center text-xl font-black text-white">
                      <span>Total Charge</span>
                      <span className="text-3xl">${amount || 0}<span className="text-slate-500 text-lg">.00</span></span>
                    </div>

                    <button 
                      type="submit"
                      disabled={isProcessing || !amount || amount < 1}
                      className="w-full bg-emerald-500 text-black font-black uppercase tracking-widest py-5 rounded-xl mt-6 hover:bg-emerald-400 transition-all active:scale-[0.98] shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm"
                    >
                      {isProcessing ? (
                        <>
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                              className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                            />
                            Processing Secure Payment...
                        </>
                      ) : (
                        `Donate $${amount || 0}`
                      )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 text-slate-500 mt-6 text-xs font-bold uppercase tracking-widest">
                       <Lock className="w-3 h-3" /> Payments processed securely by Stripe Simulated Environment
                    </div>
                  </form>
              </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
