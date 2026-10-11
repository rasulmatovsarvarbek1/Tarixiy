import React from "react";

/**
 * 3D oltin tanga SVG komponenti
 * @param {number} size - piksel o'lchami (default: 24)
 * @param {string} className - qo'shimcha CSS klasslar
 */
export default function CoinIcon({ size = 24, className = "" }) {
  const id = "ci" + size;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Yoqasi (3D qirrasi) */}
      <ellipse cx="36" cy="33" rx="22" ry="22" fill="#C8820A" />
      <ellipse cx="36" cy="31" rx="22" ry="22" fill="#D4920E" />

      {/* Asosiy disk */}
      <circle cx="30" cy="31" r="22" fill={"url(#cg" + id + ")"} />

      {/* Ichki halqa */}
      <circle cx="30" cy="31" r="18" fill={"url(#ig" + id + ")"} />
      <circle cx="30" cy="31" r="18" fill="none" stroke="#C8860A" strokeWidth="0.8" strokeOpacity="0.4" />

      {/* Yorug'lik bliki */}
      <ellipse cx="22" cy="22" rx="7" ry="4" fill="white" fillOpacity="0.22" transform="rotate(-35 22 22)" />

      {/* Dollar belgisi */}
      <text
        x="30"
        y="38"
        textAnchor="middle"
        fontSize="20"
        fontWeight="900"
        fontFamily="Arial Black, Arial, sans-serif"
        fill={"url(#tg" + id + ")"}
        style={{ userSelect: "none" }}
      >
        $
      </text>

      <defs>
        <radialGradient id={"cg" + id} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFD84D" />
          <stop offset="40%" stopColor="#F5B800" />
          <stop offset="75%" stopColor="#E8A000" />
          <stop offset="100%" stopColor="#C8800A" />
        </radialGradient>
        <radialGradient id={"ig" + id} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#F5B800" />
          <stop offset="100%" stopColor="#D49200" />
        </radialGradient>
        <linearGradient id={"tg" + id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5000" />
          <stop offset="100%" stopColor="#5C3000" />
        </linearGradient>
      </defs>
    </svg>
  );
}
<stop offset="100%" stopColor="#854D0E" />
        </linearGradient >

  {/* 3D qalin qirra soyasi */ }
  < linearGradient id = {`edge_bevel_${uid}`} x1 = "32" y1 = "2" x2 = "32" y2 = "62" gradientUnits = "userSpaceOnUse" >
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="15%" stopColor="#F59E0B" />
          <stop offset="80%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient >

  {/* Ichki chuqurlik (tanga yuzasi) radial gradienti */ }
  < radialGradient id = {`inner_face_${uid}`} cx = "38%" cy = "32%" r = "62%" >
          <stop offset="0%" stopColor="#FEF9C3" />
          <stop offset="25%" stopColor="#FDE047" />
          <stop offset="65%" stopColor="#EAB308" />
          <stop offset="90%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#A16207" />
        </radialGradient >

  {/* 3D Yulduzning yorug' (chap/tepa) qirralari */ }
  < linearGradient id = {`star_light_${uid}`} x1 = "20" y1 = "16" x2 = "38" y2 = "40" gradientUnits = "userSpaceOnUse" >
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#FEF08A" />
          <stop offset="70%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#EAB308" />
        </linearGradient >

  {/* 3D Yulduzning soya (o'ng/past) qirralari */ }
  < linearGradient id = {`star_dark_${uid}`} x1 = "28" y1 = "20" x2 = "44" y2 = "48" gradientUnits = "userSpaceOnUse" >
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient >

  {/* Yulduz 3D extrude devorlari */ }
  < linearGradient id = {`star_wall_${uid}`} x1 = "32" y1 = "20" x2 = "32" y2 = "46" gradientUnits = "userSpaceOnUse" >
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient >
      </defs >

  {/* 1. Tashqi asosiy disk (Oltin metall) */ }
  < circle cx = "32" cy = "32" r = "30" fill = {`url(#outer_rim_${uid})`} />

{/* 2. Tashqi qavariq chegara (Outer bevel ring) */ }
<circle cx="32" cy="32" r="28" stroke={`url(#edge_bevel_${uid})`} strokeWidth="2.5" fill="none" />

{/* 3. Ichki chuqur maydon (Recessed inner plate) */ }
<circle cx="32" cy="32" r="24.5" fill={`url(#inner_face_${uid})`} />

{/* 4. Ichki nafis oltin halqa (Inner groove) */ }
      <circle cx="32" cy="32" r="23" stroke="#FEF08A" strokeWidth="1" strokeOpacity="0.8" fill="none" />
      <circle cx="32" cy="32" r="21" stroke="#A16207" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />

{/* 5. 3D Yulduzning pastki ekstruziya soyasi (3D Star base shadow & depth) */ }
{/* Yulduz 3D pastki qatlami */ }
<path
  d="M32 17.5L35.8 25.2L44.3 26.4L38.1 32.4L39.6 40.8L32 36.8L24.4 40.8L25.9 32.4L19.7 26.4L28.2 25.2L32 17.5Z"
  fill={`url(#star_wall_${uid})`}
  transform="translate(0, 2)"
/>

{/* 6. 3D Yulduzning asosiy yuzasi (5 ta 3D qirra / facet) */ }
{/* Facet 1: Yuqori chap (Yorug') */ }
      <path d="M32 16.5 L32 31 L27.5 24.5 Z" fill="#FFFFFF" fillOpacity="0.85" />
      <path d="M32 16.5 L32 31 L36.5 24.5 Z" fill="#FDE047" />

{/* Facet 2: O'ng tepa */ }
      <path d="M36.5 24.5 L32 31 L45 25.8 Z" fill="#FEF08A" />
      <path d="M45 25.8 L32 31 L38.5 32 Z" fill="#EAB308" />

{/* Facet 3: O'ng pastki */ }
      <path d="M38.5 32 L32 31 L40.2 41 Z" fill="#D97706" />
      <path d="M40.2 41 L32 31 L32 37 Z" fill="#B45309" />

{/* Facet 4: Chap pastki */ }
      <path d="M32 37 L32 31 L23.8 41 Z" fill="#CA8A04" />
      <path d="M23.8 41 L32 31 L25.5 32 Z" fill="#EAB308" />

{/* Facet 5: Chap tepa */ }
      <path d="M25.5 32 L32 31 L19 25.8 Z" fill="#FACC15" />
      <path d="M19 25.8 L32 31 L27.5 24.5 Z" fill="#FEF08A" />

{/* Yulduz tashqi nozik oltin konturi */ }
<path
  d="M32 16.5L36.2 25L45.5 26.3L38.8 32.8L40.4 42L32 37.6L23.6 42L25.2 32.8L18.5 26.3L27.8 25L32 16.5Z"
  fill="none"
  stroke="#92400E"
  strokeWidth="0.8"
  strokeLinejoin="round"
/>

{/* 7. Yuqori qavariq yorug'lik akslantirishi (Top-left shiny gloss arc) */ }
      <path
        d="M13 22C16 13 23 8 32 8C38 8 43 10.5 47 14"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />
      <circle cx="16" cy="18" r="1.5" fill="#FFFFFF" fillOpacity="0.8" />
    </svg >
  );
}
