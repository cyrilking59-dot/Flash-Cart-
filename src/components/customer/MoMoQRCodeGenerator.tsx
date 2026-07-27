import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../../types';
import { 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Info,
  Scan
} from 'lucide-react';

interface MoMoQRCodeGeneratorProps {
  paymentMethod: PaymentMethod;
  amountGhs: number;
  customerPhone: string;
  onPaymentApproved: () => void;
}

export const MoMoQRCodeGenerator: React.FC<MoMoQRCodeGeneratorProps> = ({
  paymentMethod,
  amountGhs,
  customerPhone,
  onPaymentApproved
}) => {
  const [copied, setCopied] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minute validity
  const [scanningState, setScanningState] = useState<'IDLE' | 'SCANNING' | 'APPROVED'>('IDLE');

  // Countdown timer for QR code validity
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine carrier specifics
  const getCarrierDetails = () => {
    switch (paymentMethod) {
      case 'TELECEL_CASH':
        return {
          name: 'Telecel Cash',
          color: 'from-rose-500 to-red-600',
          textColor: 'text-rose-400',
          borderColor: 'border-rose-500/40',
          bgLight: 'bg-rose-500/10',
          badgeBg: 'bg-rose-500',
          shortcode: `*110#`,
          merchantId: 'TELECEL-PAY-8821',
          svgColor: '#e11d48'
        };
      case 'AT_MONEY':
        return {
          name: 'AT Money',
          color: 'from-sky-500 to-blue-600',
          textColor: 'text-sky-400',
          borderColor: 'border-sky-500/40',
          bgLight: 'bg-sky-500/10',
          badgeBg: 'bg-sky-500',
          shortcode: `*718#`,
          merchantId: 'ATMONEY-VOLTA-0412',
          svgColor: '#0284c7'
        };
      case 'MTN_MOMO':
      default:
        return {
          name: 'MTN Mobile Money',
          color: 'from-amber-400 to-yellow-500',
          textColor: 'text-amber-400',
          borderColor: 'border-amber-500/40',
          bgLight: 'bg-amber-500/10',
          badgeBg: 'bg-amber-500',
          shortcode: `*170#`,
          merchantId: 'MOMO-984210',
          svgColor: '#f59e0b'
        };
    }
  };

  const carrier = getCarrierDetails();
  const ussdPayString = `${carrier.shortcode} -> Pay Merchant -> Code: ${carrier.merchantId} -> Amount: ₵${amountGhs.toFixed(2)}`;

  const handleCopyUssd = () => {
    navigator.clipboard.writeText(`${carrier.shortcode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScan = () => {
    setScanningState('SCANNING');
    setTimeout(() => {
      setScanningState('APPROVED');
      setTimeout(() => {
        onPaymentApproved();
      }, 1000);
    }, 1500);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 space-y-4 animate-fadeIn">
      
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl ${carrier.bgLight} ${carrier.textColor} border ${carrier.borderColor}`}>
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>{carrier.name} Scan-to-Pay</span>
              <span className="text-[10px] bg-slate-900 border border-slate-800 text-amber-300 font-mono px-2 py-0.5 rounded">
                Ghana MoMo QR
              </span>
            </h5>
            <p className="text-[11px] text-slate-400">Scan with phone camera or MoMo app</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-500 uppercase font-bold">QR Expires In</div>
          <div className="text-xs font-mono font-bold text-amber-400">{formatTime(timerSeconds)}</div>
        </div>
      </div>

      {/* QR Code Canvas Card */}
      <div className="flex flex-col items-center justify-center space-y-3 py-2">
        <div className="relative bg-white p-4 rounded-2xl shadow-2xl border-4 border-slate-800 group">
          
          {/* Custom SVG QR Code Matrix */}
          <svg
            className="w-48 h-48 sm:w-52 sm:h-52"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background */}
            <rect width="100" height="100" fill="#FFFFFF" rx="4" />

            {/* Corner Finder Pattern 1 (Top Left) */}
            <rect x="6" y="6" width="22" height="22" rx="4" fill="#020617" />
            <rect x="10" y="10" width="14" height="14" rx="2" fill="#FFFFFF" />
            <rect x="13" y="13" width="8" height="8" rx="1.5" fill={carrier.svgColor} />

            {/* Corner Finder Pattern 2 (Top Right) */}
            <rect x="72" y="6" width="22" height="22" rx="4" fill="#020617" />
            <rect x="76" y="10" width="14" height="14" rx="2" fill="#FFFFFF" />
            <rect x="79" y="13" width="8" height="8" rx="1.5" fill={carrier.svgColor} />

            {/* Corner Finder Pattern 3 (Bottom Left) */}
            <rect x="6" y="72" width="22" height="22" rx="4" fill="#020617" />
            <rect x="10" y="76" width="14" height="14" rx="2" fill="#FFFFFF" />
            <rect x="13" y="79" width="8" height="8" rx="1.5" fill={carrier.svgColor} />

            {/* QR Data Grid Matrix Blocks */}
            <g fill="#020617">
              {/* Row 1 */}
              <rect x="32" y="6" width="4" height="4" rx="1" />
              <rect x="40" y="6" width="4" height="4" rx="1" />
              <rect x="48" y="6" width="4" height="4" rx="1" />
              <rect x="56" y="6" width="4" height="4" rx="1" />
              <rect x="64" y="6" width="4" height="4" rx="1" />

              {/* Row 2 */}
              <rect x="36" y="12" width="4" height="4" rx="1" fill={carrier.svgColor} />
              <rect x="44" y="12" width="4" height="4" rx="1" />
              <rect x="60" y="12" width="4" height="4" rx="1" />

              {/* Row 3 */}
              <rect x="32" y="18" width="4" height="4" rx="1" />
              <rect x="52" y="18" width="4" height="4" rx="1" fill={carrier.svgColor} />
              <rect x="64" y="18" width="4" height="4" rx="1" />

              {/* Row 4 */}
              <rect x="36" y="24" width="4" height="4" rx="1" />
              <rect x="44" y="24" width="4" height="4" rx="1" />
              <rect x="56" y="24" width="4" height="4" rx="1" fill={carrier.svgColor} />

              {/* Mid Sections */}
              <rect x="6" y="32" width="4" height="4" rx="1" />
              <rect x="14" y="32" width="4" height="4" rx="1" />
              <rect x="22" y="32" width="4" height="4" rx="1" />
              <rect x="32" y="32" width="4" height="4" rx="1" />
              <rect x="64" y="32" width="4" height="4" rx="1" />
              <rect x="72" y="32" width="4" height="4" rx="1" />
              <rect x="88" y="32" width="4" height="4" rx="1" />

              <rect x="10" y="40" width="4" height="4" rx="1" fill={carrier.svgColor} />
              <rect x="26" y="40" width="4" height="4" rx="1" />
              <rect x="76" y="40" width="4" height="4" rx="1" fill={carrier.svgColor} />
              <rect x="84" y="40" width="4" height="4" rx="1" />

              <rect x="6" y="48" width="4" height="4" rx="1" />
              <rect x="18" y="48" width="4" height="4" rx="1" />
              <rect x="72" y="48" width="4" height="4" rx="1" />
              <rect x="88" y="48" width="4" height="4" rx="1" />

              <rect x="12" y="56" width="4" height="4" rx="1" fill={carrier.svgColor} />
              <rect x="22" y="56" width="4" height="4" rx="1" />
              <rect x="76" y="56" width="4" height="4" rx="1" />
              <rect x="84" y="56" width="4" height="4" rx="1" fill={carrier.svgColor} />

              <rect x="6" y="64" width="4" height="4" rx="1" />
              <rect x="18" y="64" width="4" height="4" rx="1" fill={carrier.svgColor} />
              <rect x="32" y="64" width="4" height="4" rx="1" />
              <rect x="64" y="64" width="4" height="4" rx="1" fill={carrier.svgColor} />
              <rect x="88" y="64" width="4" height="4" rx="1" />

              {/* Bottom Right Area */}
              <rect x="32" y="72" width="4" height="4" rx="1" />
              <rect x="44" y="72" width="4" height="4" rx="1" fill={carrier.svgColor} />
              <rect x="56" y="72" width="4" height="4" rx="1" />
              <rect x="68" y="72" width="4" height="4" rx="1" />
              <rect x="80" y="72" width="4" height="4" rx="1" fill={carrier.svgColor} />

              <rect x="38" y="80" width="4" height="4" rx="1" fill={carrier.svgColor} />
              <rect x="50" y="80" width="4" height="4" rx="1" />
              <rect x="62" y="80" width="4" height="4" rx="1" />
              <rect x="74" y="80" width="4" height="4" rx="1" fill={carrier.svgColor} />
              <rect x="86" y="80" width="4" height="4" rx="1" />

              <rect x="32" y="88" width="4" height="4" rx="1" />
              <rect x="44" y="88" width="4" height="4" rx="1" />
              <rect x="58" y="88" width="4" height="4" rx="1" fill={carrier.svgColor} />
              <rect x="70" y="88" width="4" height="4" rx="1" />
              <rect x="82" y="88" width="4" height="4" rx="1" fill={carrier.svgColor} />
            </g>

            {/* Center Brand Badge Box */}
            <rect x="38" y="38" width="24" height="24" rx="6" fill="#020617" stroke={carrier.svgColor} strokeWidth="2" />
            <text x="50" y="52" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              MoMo
            </text>
          </svg>

          {/* Scanning Simulation Line Effect */}
          {scanningState === 'SCANNING' && (
            <div className="absolute inset-x-4 h-1 bg-amber-400 shadow-[0_0_15px_#f59e0b] rounded animate-pulse top-1/2 -translate-y-1/2" />
          )}

          {scanningState === 'APPROVED' && (
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur rounded-2xl flex flex-col items-center justify-center text-emerald-400 p-2 animate-fadeIn">
              <CheckCircle2 className="w-12 h-12" />
              <span className="text-xs font-black text-white mt-1">Payment Approved!</span>
            </div>
          )}
        </div>

        {/* Amount & Merchant Details */}
        <div className="text-center space-y-1">
          <div className="text-xl font-black text-amber-400 font-mono">
            ₵{amountGhs.toFixed(2)}
          </div>
          <div className="text-xs text-slate-300 font-medium">
            Merchant: <strong className="text-white">Volta Market Hubs Ltd</strong> ({carrier.merchantId})
          </div>
        </div>

      </div>

      {/* Manual USSD Option */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
        <div className="text-left space-y-0.5 min-w-0">
          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Dial USSD Shortcode
          </div>
          <div className="text-xs font-mono text-emerald-400 font-bold truncate">
            {carrier.shortcode}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyUssd}
          className="bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-amber-400" />
              <span>Copy {carrier.shortcode}</span>
            </>
          )}
        </button>
      </div>

      {/* Simulate Scan & Authorize Button */}
      <button
        type="button"
        onClick={handleSimulateScan}
        disabled={scanningState !== 'IDLE'}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
      >
        {scanningState === 'SCANNING' ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Verifying MoMo QR Scan...</span>
          </>
        ) : scanningState === 'APPROVED' ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>Scan Confirmed! Authorizing Order...</span>
          </>
        ) : (
          <>
            <Scan className="w-4 h-4" />
            <span>Simulate Scanning QR Code & Authorize Payment</span>
          </>
        )}
      </button>

    </div>
  );
};
