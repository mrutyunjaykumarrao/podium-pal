// Meditative SVG Icons with calm, flowing designs

export const LotusIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 9 6 9 10C9 12.21 10.79 14 13 14C15.21 14 17 12.21 17 10C17 6 14 2 14 2H12Z" fill={color} opacity="0.3"/>
    <path d="M8 10C8 10 5 12 5 15C5 16.66 6.34 18 8 18C9.66 18 11 16.66 11 15C11 12 8 10 8 10Z" fill={color} opacity="0.5"/>
    <path d="M16 10C16 10 19 12 19 15C19 16.66 17.66 18 16 18C14.34 18 13 16.66 13 15C13 12 16 10 16 10Z" fill={color} opacity="0.5"/>
    <path d="M12 14C12 14 9 16 9 19C9 20.66 10.34 22 12 22C13.66 22 15 20.66 15 19C15 16 12 14 12 14Z" fill={color} opacity="0.7"/>
    <circle cx="12" cy="12" r="2" fill={color}/>
  </svg>
);

export const BreathIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" opacity="0.8"/>
    <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" opacity="0.5"/>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1" opacity="0.3"/>
    <path d="M12 3V5M12 19V21M21 12H19M5 12H3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const ZenCircleIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" 
      stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
    <path d="M8 12C8 9.79 9.79 8 12 8" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
  </svg>
);

export const FlowIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12C3 12 5 8 9 8C13 8 11 16 15 16C19 16 21 12 21 12" 
      stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
    <path d="M3 8C3 8 5 4 9 4C13 4 11 12 15 12C19 12 21 8 21 8" 
      stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
    <path d="M3 16C3 16 5 12 9 12C13 12 11 20 15 20C19 20 21 16 21 16" 
      stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
  </svg>
);

export const PeaceIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M12 3V21M12 12L6 18M12 12L18 18" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const MindfulnessIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8L12 2Z" fill={color} opacity="0.6"/>
    <circle cx="12" cy="12" r="3" fill={color} opacity="0.9"/>
  </svg>
);

export const HarmonyIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12H21" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
    <circle cx="7" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" opacity="0.7"/>
    <circle cx="17" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" opacity="0.7"/>
  </svg>
);

export const GrowthIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22V12M12 12L8 16M12 12L16 16" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    <path d="M12 12C12 12 9 9 9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6C15 9 12 12 12 12Z" 
      fill={color} opacity="0.7"/>
    <circle cx="12" cy="20" r="2" fill={color}/>
  </svg>
);

export const BalanceIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2V22" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M6 8L12 14L18 8" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
    <path d="M6 16L12 10L18 16" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
  </svg>
);

export const HomeIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12L12 3L21 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 10V20C5 20.55 5.45 21 6 21H18C18.55 21 19 20.55 19 20V10" 
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    <circle cx="12" cy="15" r="2" fill={color} opacity="0.5"/>
  </svg>
);

export const SuccessLeafIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 5 5 5 13C5 17.42 8.58 21 13 21C17.42 21 21 17.42 21 13C21 5 14 2 14 2H12Z" 
      fill={color} opacity="0.4"/>
    <path d="M12 5C12 5 9 7 9 11" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
    <path d="M12 8C12 8 14 10 14 13" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

export const ImprovementArrowIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 7H9M17 7V15" 
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    <circle cx="7" cy="17" r="2" fill={color} opacity="0.5"/>
  </svg>
);
