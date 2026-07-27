// Biblioteca de ícones — traço fino consistente (24x24, currentColor).
// Substitui os emojis usados no projeto por SVGs desenhados sob medida,
// para renderizar igual em qualquer SO/navegador e herdar cor do CSS.

function Icon({ size = 20, strokeWidth = 1.75, children, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function CardIcon(props) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" />
      <path d="M2.5 9.7h19" />
      <path d="M6 14.7h4" />
    </Icon>
  );
}

export function RocketIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 2c2.8 2 4 5.3 4 8.5 0 2-.5 4-1 5.5l-3 3-3-3c-.5-1.5-1-3.5-1-5.5C8 7.3 9.2 4 12 2Z" />
      <circle cx="12" cy="9.6" r="1.6" />
      <path d="M8.2 15.6c-1.9.3-2.9 1.7-3.1 4.1 2.3 0 3.7-1 4.1-2.7" />
      <path d="M15.8 15.6c1.9.3 2.9 1.7 3.1 4.1-2.3 0-3.7-1-4.1-2.7" />
      <path d="M10.3 18.6c0 1.4.6 2.7 1.7 3.5 1.1-.8 1.7-2.1 1.7-3.5" />
    </Icon>
  );
}

export function LockIcon(props) {
  return (
    <Icon {...props}>
      <rect x="5" y="11" width="14" height="9.5" rx="2" />
      <path d="M8 11V7.8a4 4 0 0 1 8 0V11" />
      <circle cx="12" cy="15.2" r="1.3" />
      <path d="M12 16.5V18" />
    </Icon>
  );
}

export function UnlockIcon(props) {
  return (
    <Icon {...props}>
      <rect x="5" y="11" width="14" height="9.5" rx="2" />
      <path d="M8 11V7.8a4 4 0 0 1 7.4-2.1" />
      <circle cx="12" cy="15.2" r="1.3" />
      <path d="M12 16.5V18" />
    </Icon>
  );
}

export function MoneyIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2v9.6" />
      <path d="M14.6 9.3c-.4-.9-1.4-1.4-2.6-1.4-1.5 0-2.7.8-2.7 2s1.1 1.6 2.7 2c1.6.4 2.7 1 2.7 2.1 0 1.3-1.2 2-2.7 2-1.2 0-2.2-.5-2.6-1.4" />
    </Icon>
  );
}

export function PhoneIcon(props) {
  return (
    <Icon {...props}>
      <rect x="7" y="2.3" width="10" height="19.4" rx="2.3" />
      <path d="M10.8 19.2h2.4" />
    </Icon>
  );
}

export function PhoneCallIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6.2 4.2c1 0 2.2.3 2.5 1.4.3 1 .6 2 1 2.7.2.5 0 1-.4 1.4l-1.1 1c1 2 2.6 3.7 4.6 4.6l1-1.1c.4-.4.9-.6 1.4-.4.8.4 1.7.8 2.7 1 1.1.3 1.4 1.6 1.4 2.6 0 1.8-1.6 3.1-3.3 2.7C10.7 18.9 5.4 13.5 4.2 8.2 3.8 6.5 5 4.2 6.2 4.2Z" />
    </Icon>
  );
}

export function SparkleIcon(props) {
  return (
    <Icon {...props} fill="currentColor" stroke="none">
      <path d="M12 2.5l1.6 5.4 5.4 1.6-5.4 1.6L12 16.5l-1.6-5.4-5.4-1.6 5.4-1.6L12 2.5Z" />
      <path d="M19 15.5l.8 2.5 2.5.8-2.5.8-.8 2.5-.8-2.5-2.5-.8 2.5-.8.8-2.5Z" />
    </Icon>
  );
}

export function StarIcon(props) {
  return (
    <Icon {...props} fill="currentColor" stroke="none">
      <path d="M12 3.2l2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.2 6-.9L12 3.2Z" />
    </Icon>
  );
}

export function CheckIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5 12.5l4.8 4.8L19 7.5" />
    </Icon>
  );
}

export function CheckCircleIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.3 12.3l2.6 2.6 5-5.4" />
    </Icon>
  );
}

export function WarningIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.3 21.3 19.5H2.7L12 3.3Z" />
      <path d="M12 9.8v4" />
      <circle cx="12" cy="16.7" r="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function PartyIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5.3 19 8 10.2l6.3 3.1L11.6 19H5.3Z" />
      <path d="M16.2 6.4 17.6 5M18.5 9.8l1.8-.6M13.8 4.2l.6-1.8" />
      <circle cx="19.5" cy="4.5" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function TrophyIcon(props) {
  return (
    <Icon {...props}>
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M8 5.2H5.3a3 3 0 0 0 3.2 3.8" />
      <path d="M16 5.2h2.7a3 3 0 0 1-3.2 3.8" />
      <path d="M12 12v2.7" />
      <path d="M8.8 19.5h6.4" />
      <path d="M9.6 15.3h4.8l.5 4.2H9.1l.5-4.2Z" />
    </Icon>
  );
}

export function LightningIcon(props) {
  return (
    <Icon {...props} fill="currentColor" stroke="none">
      <path d="M13 2 5 13.6h5.4L9.4 22l8.6-12.4h-5.5L13 2Z" />
    </Icon>
  );
}

export function SmileIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 10.3h.01M15.5 10.3h.01" strokeWidth="2.6" />
      <path d="M8.1 14c1 1.6 2.3 2.4 3.9 2.4s2.9-.8 3.9-2.4" />
    </Icon>
  );
}

export function TruckIcon(props) {
  return (
    <Icon {...props}>
      <rect x="2" y="8" width="11.5" height="8" rx="1.2" />
      <path d="M13.5 11H17l2.5 3v2H17.5" />
      <circle cx="6.3" cy="17.6" r="1.6" />
      <circle cx="16.3" cy="17.6" r="1.6" />
      <path d="M13.5 16h-2.7" />
    </Icon>
  );
}

export function ChatIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4.5 5.8a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H10l-4 3.4v-3.4H6.5a2 2 0 0 1-2-2v-7Z" />
    </Icon>
  );
}

export function TargetIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function ClipboardIcon(props) {
  return (
    <Icon {...props}>
      <rect x="6" y="4.5" width="12" height="16" rx="2" />
      <rect x="9" y="3" width="6" height="3" rx="1" />
      <path d="M9 11.2h6M9 14.7h6M9 18.2h4" />
    </Icon>
  );
}

export function BankIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 9.5 12 4l9 5.5" />
      <path d="M4.3 9.5h15.4V19H4.3V9.5Z" />
      <path d="M3.5 19h17" />
      <path d="M7.5 12.2v4M12 12.2v4M16.5 12.2v4" />
    </Icon>
  );
}

export function EyeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M2.5 12S6 5.7 12 5.7 21.5 12 21.5 12 18 18.3 12 18.3 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </Icon>
  );
}

export function EyeOffIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.8A10.4 10.4 0 0 1 12 5.7c6 0 9.5 6.3 9.5 6.3a15 15 0 0 1-3.2 4M6.6 7.4A14.4 14.4 0 0 0 2.5 12S6 18.3 12 18.3c1.3 0 2.5-.3 3.6-.7" />
      <path d="M9.9 10.1a2.6 2.6 0 0 0 3.7 3.6" />
    </Icon>
  );
}

export function ImageIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3" y="4.5" width="18" height="14" rx="2" />
      <circle cx="8.3" cy="9.3" r="1.5" />
      <path d="M3.5 16l5-4.5 3.3 2.9 3-2.5 5.7 4.6" />
    </Icon>
  );
}

export function PaletteIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5C6.8 3.5 3 7.3 3 12c0 3.9 2.8 5.5 5.2 5.5.9 0 1.3-.5 1.3-1.1 0-.6-.4-.9-.4-1.7 0-.9.7-1.6 1.6-1.6h2.1c3 0 5.7-1.9 5.7-5.4 0-3.4-3-4.2-6.5-4.2Z" />
      <circle cx="7.6" cy="10.6" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.6" cy="7.4" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.6" cy="7.7" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.8" cy="10.9" r="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function HomeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 9.6V20h12V9.6" />
      <path d="M10 20v-5.5h4V20" />
    </Icon>
  );
}

export function QuestionIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.4a2.5 2.5 0 1 1 3.7 2.2c-.8.5-1.2 1-1.2 2" />
      <circle cx="12" cy="16.7" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function FileIcon(props) {
  return (
    <Icon {...props}>
      <path d="M7 2.5h7l4 4V21H7V2.5Z" />
      <path d="M14 2.5V7h4" />
      <path d="M9.5 12h5M9.5 15.5h5M9.5 9h2.3" />
    </Icon>
  );
}

export function SaveIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4.5 4h11l4 4v12h-15V4Z" />
      <path d="M8 4v5h7V4" />
      <rect x="7.5" y="13" width="9" height="6" />
    </Icon>
  );
}

export function GlobeIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.6 2.3 2.6 15 0 17" />
      <path d="M12 3.5c-2.6 2.3-2.6 15 0 17" />
      <path d="M4.7 7.5h14.6M4.7 16.5h14.6" />
    </Icon>
  );
}

export function PinIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 21s6-5.7 6-10.5A6 6 0 0 0 6 10.5C6 15.3 12 21 12 21Z" />
      <circle cx="12" cy="10.3" r="2.2" />
    </Icon>
  );
}

export function BulbIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9.2 18.5h5.6" />
      <path d="M9.7 21h4.6" />
      <path d="M12 3a6.5 6.5 0 0 0-3.5 12c.7.5 1 1 1 1.8v.7h5v-.7c0-.8.3-1.3 1-1.8A6.5 6.5 0 0 0 12 3Z" />
    </Icon>
  );
}

export function SearchIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M19.5 19.5l-4.3-4.3" />
    </Icon>
  );
}

export function TrashIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4.5 7h15" />
      <path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2" />
      <path d="M6.5 7 7.3 20a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
      <path d="M10 11v6M14 11v6" />
    </Icon>
  );
}

export function InboxIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3.5 12.5 6 4.5h12l2.5 8" />
      <path d="M3.5 12.5H9l1.3 2.2h3.4l1.3-2.2h5.5v6.5h-17v-6.5Z" />
    </Icon>
  );
}

export function KeyIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="7.5" cy="12" r="4" />
      <path d="M11 12h10M17 12v3M20 12v2.5" />
    </Icon>
  );
}

export function ChartIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M7.5 16v-4M12 16V8M16.5 16v-6" />
    </Icon>
  );
}

export function BuildingIcon(props) {
  return (
    <Icon {...props}>
      <rect x="5" y="3.5" width="10" height="17" rx="1" />
      <path d="M15 9h4v11.5h-4" />
      <path d="M8 7h1M11 7h1M8 10.5h1M11 10.5h1M8 14h1M11 14h1" />
    </Icon>
  );
}

export function ShieldIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.3 19 6.3v5c0 5-3 8.3-7 9.5-4-1.2-7-4.5-7-9.5v-5L12 3.3Z" />
      <path d="M9 12l2.2 2.2L15.5 9.8" />
    </Icon>
  );
}

export function BellIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3.5a5.5 5.5 0 0 0-5.5 5.5v3l-1.5 3.5h14L17.5 12V9A5.5 5.5 0 0 0 12 3.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Icon>
  );
}

export function LinkIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 7.5l1.4-1.4a4 4 0 0 1 5.6 5.6L16.5 13" />
      <path d="M13 16.5l-1.4 1.4a4 4 0 0 1-5.6-5.6L7.5 11" />
    </Icon>
  );
}

export function UserIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8.3" r="3.8" />
      <path d="M4.5 20c1-3.8 4-5.8 7.5-5.8s6.5 2 7.5 5.8" />
    </Icon>
  );
}

export function UsersIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="8.3" r="3.3" />
      <path d="M2.8 19c.8-3.3 3.3-5 6.2-5s5.4 1.7 6.2 5" />
      <path d="M15.5 5.3a3.3 3.3 0 0 1 0 6.4" />
      <path d="M17 14.2c2 .5 3.6 2 4.2 4.8" />
    </Icon>
  );
}

export function CalendarIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v4M16 3v4" />
      <path d="M7.5 13h2M11 13h2M14.5 13h2M7.5 16.5h2M11 16.5h2" />
    </Icon>
  );
}

export function CrownIcon(props) {
  return (
    <Icon {...props} fill="currentColor" stroke="none">
      <path d="M4 18.2h16l-1.3-8-4.2 3.2L12 7.8 9.5 13.4l-4.2-3.2-1.3 8Z" />
      <rect x="4" y="19.4" width="16" height="1.6" rx="0.6" />
    </Icon>
  );
}

export function RefreshIcon(props) {
  return (
    <Icon {...props}>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 4v4.5h-4.5" />
    </Icon>
  );
}

export function UndoIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 12a8 8 0 1 0 2.3-5.6" />
      <path d="M4 4v4.5h4.5" />
    </Icon>
  );
}

export function ArrowLeftIcon(props) {
  return (
    <Icon {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Icon>
  );
}

export function ArrowRightIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
}

export function ArrowUpIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </Icon>
  );
}

export function ArrowDownIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M18 13l-6 6-6-6" />
    </Icon>
  );
}

export function ArrowUpRightIcon(props) {
  return (
    <Icon {...props}>
      <path d="M7 17 17 7M9 7h8v8" />
    </Icon>
  );
}

export function CloseIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
  );
}

export function ChevronDownIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5.5 8.5 12 15l6.5-6.5" />
    </Icon>
  );
}

export function GridIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.4" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.4" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.4" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.4" />
    </Icon>
  );
}

export function SettingsIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="2.8" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4.5a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3H10.7a1.7 1.7 0 0 0 1-1.6V4.5a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9V10.7a1.7 1.7 0 0 0 1.6 1h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" />
    </Icon>
  );
}

export function DotSolidIcon(props) {
  return (
    <Icon {...props} fill="currentColor" stroke="none">
      <circle cx="12" cy="12" r="7" />
    </Icon>
  );
}

export function DotHalfIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 5a7 7 0 0 1 0 14Z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function DotRingIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="7" strokeDasharray="3 3.5" />
    </Icon>
  );
}

export function PackageIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3 20.5 7.5v9L12 21 3.5 16.5v-9L12 3Z" />
      <path d="M3.8 7.4 12 12l8.2-4.6" />
      <path d="M12 12v9" />
      <path d="M16.2 5.2 8 9.8" />
    </Icon>
  );
}

export function LogoutIcon(props) {
  return (
    <Icon {...props}>
      <path d="M15 4.5h2.5A2 2 0 0 1 19.5 6.5v11a2 2 0 0 1-2 2H15" />
      <path d="M4.5 12h11" />
      <path d="M11.5 8 15.5 12 11.5 16" />
    </Icon>
  );
}

// Mapa usado pelos benefícios personalizáveis do admin (icon-key -> componente)
export const BENEFIT_ICONS = {
  card: CardIcon,
  rocket: RocketIcon,
  lock: LockIcon,
  money: MoneyIcon,
  phone: PhoneIcon,
  sparkle: SparkleIcon,
  shield: ShieldIcon,
  bell: BellIcon,
  star: StarIcon,
  bulb: BulbIcon,
  target: TargetIcon,
  trophy: TrophyIcon,
  lightning: LightningIcon,
  globe: GlobeIcon,
  gift: PartyIcon,
};

export const BENEFIT_ICON_KEYS = Object.keys(BENEFIT_ICONS);
