import React from 'react';
import './icons.css';

// --- Large Icons (24px) ---

export const CarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const DriverIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export const MapIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13v-6m0-6V4a1 1 0 01.553-.894l6-3A1 1 0 0117 1v12.382a1 1 0 01-.553.894L15 17m-6 3v-6m6 3V7m-6 6h6" />
    </svg>
);

export const ReportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

export const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

export const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

export const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const BotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-lg" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m14 0h2M3 15h2m14 0h2M9 6a3 3 0 100-6 3 3 0 000 6zM9 18a3 3 0 100 6 3 3 0 000-6zm6-12a3 3 0 100-6 3 3 0 000 6zm6 12a3 3 0 100 6 3 3 0 000-6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12a3 3 0 100-6 3 3 0 000 6zm6 0a3 3 0 100-6 3 3 0 000 6zm-3 6a3 3 0 10-6 0 3 3 0 006 0zm-3-6a3 3 0 10-6 0 3 3 0 006 0z" />
    </svg>
);

// --- Medium Icons (20px) ---

export const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-md fill-current" viewBox="0 0 20 20">
      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

export const DotsVerticalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-md fill-current" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
);

export const ArchiveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-md" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h16" />
    </svg>
);

export const PackageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-md" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

export const UserCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-md" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-md" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

export const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-md" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-md" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

export const GoogleIcon = () => (
    <svg className="icon icon-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C42.775,34.806,44,30.028,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

// --- Small Icons (16px) ---

export const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
);

export const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-sm" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

// --- Special Components ---

export const LoadingSpinner = () => (
    <svg className="icon icon-md spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const StatusIcon = ({ status }) => {
    let colorClass = 'status-gray';
    switch (status) {
        case 'active':
        case 'on-shift':
            colorClass = 'status-green';
            break;
        case 'idle':
        case 'on-break':
            colorClass = 'status-yellow';
            break;
        case 'maintenance':
            colorClass = 'status-red';
            break;
        default: // off-duty
            colorClass = 'status-gray';
            break;
    }
    return <span className={`status-dot ${colorClass}`}></span>;
};

export const SidebarIcon = ({ tab }) => {
    switch (tab) {
        case 'vehicles': return <CarIcon />;
        case 'drivers': return <DriverIcon />;
        case 'map': return <MapIcon />;
        case 'reports': return <ReportIcon />;
        case 'active-vehicles': return <ClockIcon />;
        case 'customers': return <UsersIcon />;
        default: return null;
    }
};