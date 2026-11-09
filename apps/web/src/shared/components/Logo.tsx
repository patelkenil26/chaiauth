import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 font-sans ${className || ""}`}>
      <span className="relative flex items-center justify-center p-0 hover:scale-105 transition-transform duration-300">
        <svg viewBox="0 0 100 100" className="h-10 w-10 drop-shadow-xl" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="chaiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#ea580c" floodOpacity="0.4"/>
            </filter>
          </defs>
          
          <g filter="url(#glow)">
            {/* Steam */}
            <path d="M27 34c-4-4-4-8 0-12s4-8 0-12" fill="none" stroke="url(#chaiGrad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M42 38c-4-4-4-8 0-12s4-8 0-12" fill="none" stroke="url(#chaiGrad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M57 34c-4-4-4-8 0-12s4-8 0-12" fill="none" stroke="url(#chaiGrad)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            
            {/* Cup Body */}
            <path d="M17 45 h50 v14 c0 15 -11.2 26 -25 26 s-25 -11 -25 -26 z" fill="url(#chaiGrad)" />
            
            {/* Cup Handle */}
            <path d="M66 50 h8 a10 10 0 0 1 0 20 h-8" fill="none" stroke="url(#chaiGrad)" strokeWidth="7" strokeLinecap="round"/>
          </g>
        </svg>
      </span>
      <span className="text-[1.2rem] font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
        Chai<span className="text-primary">Auth</span>
      </span>
    </Link>
  );
}
