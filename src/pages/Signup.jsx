import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import rgLogo from '../assets/logo/RGLOGO.png';

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect to /login
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans px-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #141312 0%, #26160C 50%, #141312 100%)',
      }}
    >
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-orange-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-500/10 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md bg-[#1C1B1A]/85 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl text-center">
        <div className="mb-4 sm:mb-6 flex justify-center">
          <img
            src={rgLogo}
            alt="RG EduCore Logo"
            style={{ mixBlendMode: 'screen' }}
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
          />
        </div>

        <div className="inline-flex p-2.5 sm:p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-3 sm:mb-4">
          <Lock size={24} />
        </div>

        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">
          Institutional Access Only
        </h2>

        <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6">
          Direct self-registration is disabled. All school instances and administrator credentials are provisioned exclusively via the{' '}
          <span className="text-orange-400 font-semibold">RGES Admin Portal</span>.
        </p>

        <button
          onClick={() => navigate('/login', { replace: true })}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
        >
          <span>Go to School Login</span>
          <ArrowRight size={16} />
        </button>

        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-stone-500 text-xs">
          <ShieldCheck size={14} className="text-orange-400" />
          <span>Managed by Central Multi-Tenant Registry</span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
