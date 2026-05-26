'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AppSidebarProps {
  displayName: string;
  initials: string;
  signOutForm: React.ReactNode;
}

export default function AppSidebar({ displayName, initials, signOutForm }: AppSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/app') {
      // Dashboard is active only at exactly /app
      return pathname === '/app';
    }
    return pathname.startsWith(href);
  };

  const navItems = [
    {
      href: '/app',
      label: 'Dashboard',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={16} height={16}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/app/resumes',
      label: 'My Resumes',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={16} height={16}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      href: '/app/history',
      label: 'History',
      icon: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} width={16} height={16}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        background: '#08080f',
        borderRight: '1px solid rgba(124,58,237,0.15)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        gap: 4,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '6px 10px',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5} width={16} height={16}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#f4f4f5',
            letterSpacing: '-0.3px',
          }}
        >
          SF Resume
        </span>
      </div>

      {/* Section label */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: '#3f3f46',
          padding: '6px 10px 4px',
          marginTop: 8,
        }}
      >
        Workspace
      </div>

      {/* Nav items */}
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 10px',
              borderRadius: 8,
              textDecoration: 'none',
              background: active ? 'rgba(124,58,237,0.18)' : 'transparent',
              border: active
                ? '1px solid rgba(124,58,237,0.3)'
                : '1px solid transparent',
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: active
                  ? 'rgba(124,58,237,0.2)'
                  : 'rgba(255,255,255,0.05)',
                color: active ? '#a855f7' : '#52525b',
              }}
            >
              {item.icon}
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: active ? '#e9d5ff' : '#71717a',
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* User section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '12px 10px 8px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          {initials}
        </div>

        {/* Name + plan */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#d4d4d8',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {displayName}
          </div>
          <div style={{ fontSize: 10, color: '#52525b', marginTop: 1 }}>
            Free plan
          </div>
        </div>

        {/* Sign-out form (passed as ReactNode from server component) */}
        {signOutForm}
      </div>
    </aside>
  );
}
