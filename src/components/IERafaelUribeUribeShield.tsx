import React from 'react';

interface IERafaelUribeUribeShieldProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'shield' | 'badge' | 'full';
  showText?: boolean;
  className?: string;
}

export const IERafaelUribeUribeShield: React.FC<IERafaelUribeUribeShieldProps> = ({
  size = 'md',
  showText = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { width: 36, height: 42, text: 'text-[10px]' },
    md: { width: 48, height: 56, text: 'text-xs' },
    lg: { width: 72, height: 84, text: 'text-sm' },
    xl: { width: 104, height: 122, text: 'text-base' },
    '2xl': { width: 160, height: 188, text: 'text-lg' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Escudo Oficial Oficial de la Institución Educativa Rafael Uribe Uribe */}
      <div
        className="relative shrink-0 filter drop-shadow-md transition-transform hover:scale-105"
        style={{ width: currentSize.width, height: currentSize.height }}
      >
        <svg
          viewBox="0 0 200 230"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef233c" />
              <stop offset="60%" stopColor="#d90429" />
              <stop offset="100%" stopColor="#9b091f" />
            </linearGradient>

            <linearGradient id="yellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffa65" />
              <stop offset="60%" stopColor="#ffd100" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            <linearGradient id="anchorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="40%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="bookWhiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>

            {/* Arcs for Text on Paths */}
            {/* Top Arc for INSTITUCIÓN EDUCATIVA */}
            <path id="topBannerArc" d="M 28,42 Q 100,16 172,42" />

            {/* Middle Arc for DIOS, CIENCIA Y LABOR */}
            <path id="mottoBannerArc" d="M 44,166 Q 100,208 156,166" />

            {/* Bottom Arc for RAFAEL URIBE URIBE */}
            <path id="bottomBannerArc" d="M 28,184 Q 100,236 172,184" />
          </defs>

          {/* 1. OUTER RED SHIELD FRAME */}
          <path
            d="M 100,6 
               C 135,6 168,14 182,24
               C 176,38 178,48 184,58
               C 192,86 188,130 156,172
               C 140,192 118,212 100,224
               C 82,212 60,192 44,172
               C 12,130 8,86 16,58
               C 22,48 24,38 18,24
               C 32,14 65,6 100,6 Z"
            fill="url(#redGrad)"
            stroke="#1e293b"
            strokeWidth="3"
          />

          {/* 2. INNER SHIELD (DIAGONALLY DIVIDED YELLOW & BLUE) */}
          <g>
            <clipPath id="innerShieldClip">
              <path
                d="M 100,46
                   C 130,46 160,52 166,60
                   C 174,84 170,120 144,152
                   C 132,168 114,182 100,190
                   C 86,182 68,168 56,152
                   C 30,120 26,84 34,60
                   C 40,52 70,46 100,46 Z"
              />
            </clipPath>

            <g clipPath="url(#innerShieldClip)">
              {/* Background Yellow & Blue Diagonal */}
              {/* Top-Left Yellow Half */}
              <path
                d="M 0,0 L 200,0 L 200,80 L 50,190 L 0,190 Z"
                fill="url(#yellowGrad)"
              />
              {/* Bottom-Right Blue Half */}
              <path
                d="M 200,80 L 200,230 L 0,230 L 0,190 L 50,190 Z"
                fill="url(#blueGrad)"
              />

              {/* Diagonal Divider Line */}
              <line
                x1="200"
                y1="80"
                x2="50"
                y2="190"
                stroke="#1e293b"
                strokeWidth="2"
              />
            </g>

            {/* Inner Shield Border */}
            <path
              d="M 100,46
                 C 130,46 160,52 166,60
                 C 174,84 170,120 144,152
                 C 132,168 114,182 100,190
                 C 86,182 68,168 56,152
                 C 30,120 26,84 34,60
                 C 40,52 70,46 100,46 Z"
              fill="none"
              stroke="#1e293b"
              strokeWidth="2.5"
            />
          </g>

          {/* 3. CENTRAL EMBLEM: OPEN BOOK & CHALICE/VASE BASE */}
          <g id="central-book-and-vase">
            {/* White Vase / Chalice / Base holding the book */}
            <path
              d="M 82,126 L 118,126 L 112,170 C 108,174 92,174 88,170 Z"
              fill="url(#bookWhiteGrad)"
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Golden rim on vase */}
            <line x1="86" y1="130" x2="114" y2="130" stroke="#d97706" strokeWidth="1.5" />
            <line x1="89" y1="166" x2="111" y2="166" stroke="#d97706" strokeWidth="1.5" />

            {/* Open White Book Pages */}
            {/* Left Page (angled) */}
            <path
              d="M 98,82 C 86,80 72,82 64,88 L 74,136 C 82,130 94,130 98,132 Z"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Right Page (angled) */}
            <path
              d="M 102,82 C 114,80 128,82 136,88 L 126,136 C 118,130 106,130 102,132 Z"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Additional background page layers */}
            <path
              d="M 64,88 L 60,94 L 70,140 L 74,136 Z"
              fill="#e2e8f0"
              stroke="#0f172a"
              strokeWidth="1.2"
            />
            <path
              d="M 136,88 L 140,94 L 130,140 L 126,136 Z"
              fill="#e2e8f0"
              stroke="#0f172a"
              strokeWidth="1.2"
            />

            {/* Book text lines (Knowledge & Wisdom) */}
            <line x1="72" y1="94" x2="94" y2="92" stroke="#64748b" strokeWidth="1.2" />
            <line x1="74" y1="102" x2="94" y2="100" stroke="#64748b" strokeWidth="1.2" />
            <line x1="76" y1="110" x2="94" y2="108" stroke="#64748b" strokeWidth="1.2" />
            <line x1="78" y1="118" x2="94" y2="116" stroke="#64748b" strokeWidth="1.2" />

            <line x1="106" y1="92" x2="128" y2="94" stroke="#64748b" strokeWidth="1.2" />
            <line x1="106" y1="100" x2="126" y2="102" stroke="#64748b" strokeWidth="1.2" />
            <line x1="106" y1="108" x2="124" y2="110" stroke="#64748b" strokeWidth="1.2" />
            <line x1="106" y1="116" x2="122" y2="118" stroke="#64748b" strokeWidth="1.2" />
          </g>

          {/* 4. CENTRAL EMBLEM: ANCHOR (ANCLA - SÍMBOLO DE ESPERANZA Y CONSTANCIA) */}
          <g id="central-anchor">
            {/* Top Anchor Ring & Cross */}
            {/* Top Ring / Loop */}
            <ellipse
              cx="100"
              cy="48"
              rx="6.5"
              ry="5.5"
              fill="none"
              stroke="#0f172a"
              strokeWidth="3"
            />
            {/* Anchor Crossbar (Cepo horizontal) */}
            <path
              d="M 68,64 L 132,64"
              stroke="url(#anchorGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="68" cy="64" r="3.5" fill="#0f172a" />
            <circle cx="132" cy="64" r="3.5" fill="#0f172a" />

            {/* Anchor Vertical Shank (Caña vertical) */}
            <path
              d="M 100,53 L 100,165"
              stroke="url(#anchorGrad)"
              strokeWidth="6"
              strokeLinecap="square"
            />

            {/* Anchor Curved Arms & Flukes (Brazos y Uñas del Ancla) */}
            <path
              d="M 66,134 C 74,166 126,166 134,134"
              fill="none"
              stroke="url(#anchorGrad)"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* Left & Right Flukes (Puntas del ancla) */}
            <polygon
              points="66,134 60,126 73,129"
              fill="#0f172a"
            />
            <polygon
              points="134,134 140,126 127,129"
              fill="#0f172a"
            />

            {/* Bottom Point / Crown of Anchor */}
            <polygon
              points="94,162 106,162 100,172"
              fill="#0f172a"
            />
          </g>

          {/* 5. INNER WHITE BANNER: "DIOS, CIENCIA Y LABOR" */}
          <g id="motto-banner">
            <path
              d="M 36,150 
                 C 58,190 142,190 164,150 
                 C 148,176 52,176 36,150 Z"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="1.8"
            />
            <text
              fill="#0f172a"
              fontSize="9"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              letterSpacing="1"
            >
              <textPath
                href="#mottoBannerArc"
                startOffset="50%"
                textAnchor="middle"
              >
                DIOS, CIENCIA Y LABOR
              </textPath>
            </text>
          </g>

          {/* 6. TOP RED BANNER TEXT: "INSTITUCIÓN EDUCATIVA" */}
          <g id="top-banner-text">
            <text
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="0.8"
              paintOrder="stroke fill"
              fontSize="12.5"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              letterSpacing="0.8"
            >
              <textPath
                href="#topBannerArc"
                startOffset="50%"
                textAnchor="middle"
              >
                INSTITUCIÓN EDUCATIVA
              </textPath>
            </text>
          </g>

          {/* 7. BOTTOM RED BANNER TEXT: "RAFAEL URIBE URIBE" */}
          <g id="bottom-banner-text">
            <text
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="0.8"
              paintOrder="stroke fill"
              fontSize="12"
              fontWeight="900"
              fontFamily="Impact, Arial Black, sans-serif"
              letterSpacing="1.2"
            >
              <textPath
                href="#bottomBannerArc"
                startOffset="50%"
                textAnchor="middle"
              >
                RAFAEL URIBE URIBE
              </textPath>
            </text>
          </g>
        </svg>
      </div>

      {/* Optional Institutional Text Label */}
      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <span className="font-extrabold text-slate-900 tracking-tight text-xs sm:text-sm">
            I.E. Rafael Uribe Uribe
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
              Dios, Ciencia y Labor
            </span>
            <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
              Medellín
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
