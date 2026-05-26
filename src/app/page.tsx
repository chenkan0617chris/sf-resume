// Landing page. Shows marketing content + sign-in CTA when logged out;
// redirects to /app when logged in.

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import SignInButton from '@/components/auth/SignInButton';

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect('/app');
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] text-[#f4f4f5]">

      {/* ── NAV ── */}
      <nav
        className="grid-bg"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(8,8,15,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(124,58,237,0.12)',
          padding: '0 40px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#f4f4f5', letterSpacing: '-0.3px' }}>
            SF Resume
          </span>
        </div>

        {/* Nav CTA */}
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#a855f7',
            border: '1px solid rgba(168,85,247,0.3)',
            borderRadius: '20px',
            padding: '7px 18px',
            background: 'rgba(124,58,237,0.08)',
          }}
        >
          Sign in →
        </div>
      </nav>

      {/* ── HERO ── */}
      <div
        className="grid-bg"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '80px 40px 72px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.28) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        {/* Eyebrow pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(124,58,237,0.12)',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: '20px',
            padding: '5px 14px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#a855f7',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#a855f7',
              display: 'inline-block',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
          AI-Powered Resume Tailoring
        </div>

        {/* H1 */}
        <h1
          style={{
            fontSize: '52px',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-2px',
            color: '#f4f4f5',
            marginBottom: '20px',
          }}
        >
          Land more interviews
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #a855f7, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            every application
          </span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: '17px',
            lineHeight: 1.65,
            color: '#a1a1aa',
            maxWidth: '520px',
            margin: '0 auto 36px',
          }}
        >
          Paste a job description, get back an ATS-optimized resume and a tailored cover letter — gap-analyzed and rewritten by AI in under 30 seconds.
        </p>

        <SignInButton />

        <p style={{ fontSize: '12px', color: '#52525b', marginTop: '12px' }}>
          Free to start · No credit card required
        </p>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(124,58,237,0.08)', margin: 0 }} />

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '72px 40px', maxWidth: '1000px', margin: '0 auto' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#7c3aed',
            marginBottom: '12px',
          }}
        >
          How it works
        </div>
        <div
          style={{
            fontSize: '32px',
            fontWeight: 800,
            letterSpacing: '-1px',
            color: '#f4f4f5',
            marginBottom: '14px',
            lineHeight: 1.15,
          }}
        >
          From job posting to
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #a855f7, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ready-to-send resume
          </span>
        </div>
        <p style={{ fontSize: '15px', color: '#71717a', maxWidth: '480px', lineHeight: 1.6, marginBottom: '40px' }}>
          Three steps, under a minute.
        </p>

        {/* Steps grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            {
              num: '1',
              title: 'Upload your resume',
              desc: 'Import a PDF, Word doc, or paste your resume as text. We store it securely for future applications.',
            },
            {
              num: '2',
              title: 'Paste the job description',
              desc: 'Drop in the full JD. Our AI analyses the skills, keywords, and requirements — scoring how well you match.',
            },
            {
              num: '3',
              title: 'Download tailored PDF',
              desc: 'Get a rewritten resume and cover letter, optimized for that exact role. One-click PDF download.',
            },
          ].map(({ num, title, desc }) => (
            <div
              key={num}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#fff',
                  marginBottom: '14px',
                }}
              >
                {num}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#e4e4e7', marginBottom: '6px' }}>{title}</div>
              <div style={{ fontSize: '13px', color: '#71717a', lineHeight: 1.55 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(124,58,237,0.08)', margin: 0 }} />

      {/* ── RESUME TAILORING EXAMPLE ── */}
      <section style={{ padding: '72px 40px', maxWidth: '1000px', margin: '0 auto' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#7c3aed',
            marginBottom: '12px',
          }}
        >
          Resume tailoring
        </div>
        <div
          style={{
            fontSize: '32px',
            fontWeight: 800,
            letterSpacing: '-1px',
            color: '#f4f4f5',
            marginBottom: '14px',
            lineHeight: 1.15,
          }}
        >
          See the gap analysis
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #a855f7, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            in action
          </span>
        </div>
        <p style={{ fontSize: '15px', color: '#71717a', maxWidth: '480px', lineHeight: 1.6, marginBottom: '40px' }}>
          Real output from a Software Engineer application at Stripe.
        </p>

        {/* Demo grid: 2 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>

          {/* Left column: JD snippet + match analysis */}
          <div>
            {/* JD Snippet panel */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid rgba(124,58,237,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block', marginLeft: '4px' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', marginLeft: '4px' }} />
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#71717a',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    marginLeft: '8px',
                  }}
                >
                  Job Description — Stripe · Senior SWE
                </span>
              </div>
              <div style={{ padding: '18px', fontSize: '12px', lineHeight: 1.65, color: '#9ca3af' }}>
                <strong style={{ color: '#e4e4e7', fontWeight: 600 }}>Requirements:</strong>
                <div style={{ marginTop: '8px' }}>
                  {'• 5+ years experience with '}
                  <span
                    style={{
                      background: 'rgba(168,85,247,0.15)',
                      border: '1px solid rgba(168,85,247,0.3)',
                      borderRadius: '4px',
                      padding: '1px 5px',
                      color: '#c084fc',
                      fontWeight: 600,
                    }}
                  >
                    distributed systems
                  </span>
                  <br />
                  {'• Strong proficiency in '}
                  <span
                    style={{
                      background: 'rgba(168,85,247,0.15)',
                      border: '1px solid rgba(168,85,247,0.3)',
                      borderRadius: '4px',
                      padding: '1px 5px',
                      color: '#c084fc',
                      fontWeight: 600,
                    }}
                  >
                    Go or Rust
                  </span>
                  <br />
                  {'• Experience with '}
                  <span
                    style={{
                      background: 'rgba(168,85,247,0.15)',
                      border: '1px solid rgba(168,85,247,0.3)',
                      borderRadius: '4px',
                      padding: '1px 5px',
                      color: '#c084fc',
                      fontWeight: 600,
                    }}
                  >
                    Kubernetes
                  </span>
                  {' and container orchestration'}
                  <br />
                  {'• Background in '}
                  <span
                    style={{
                      background: 'rgba(168,85,247,0.15)',
                      border: '1px solid rgba(168,85,247,0.3)',
                      borderRadius: '4px',
                      padding: '1px 5px',
                      color: '#c084fc',
                      fontWeight: 600,
                    }}
                  >
                    payments infrastructure
                  </span>
                  {' a plus'}
                  <br />
                  {'• Proven track record of '}
                  <span
                    style={{
                      background: 'rgba(168,85,247,0.15)',
                      border: '1px solid rgba(168,85,247,0.3)',
                      borderRadius: '4px',
                      padding: '1px 5px',
                      color: '#c084fc',
                      fontWeight: 600,
                    }}
                  >
                    system design
                  </span>
                  {' at scale'}
                </div>
              </div>
            </div>

            {/* Match Analysis panel */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '10px 16px', borderBottom: '1px solid rgba(124,58,237,0.12)' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Match Analysis
                </span>
              </div>
              <div style={{ padding: '18px', fontSize: '12px', lineHeight: 1.65, color: '#9ca3af' }}>
                {/* Score row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      border: '2px solid #7c3aed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#a855f7',
                      flexShrink: 0,
                    }}
                  >
                    84
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#71717a' }}>Overall Match Score</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#f4f4f5' }}>
                      84<span style={{ fontSize: '13px', color: '#71717a' }}>/100</span>
                    </div>
                  </div>
                </div>

                {/* Gap items */}
                {[
                  { badge: 'Matched', badgeStyle: { background: 'rgba(34,197,94,0.12)', color: '#4ade80' }, text: 'Distributed systems — 6 yrs at Cloudflare', last: false },
                  { badge: 'Partial', badgeStyle: { background: 'rgba(234,179,8,0.15)', color: '#fbbf24' }, text: 'Go proficiency — mentioned but no projects listed', last: false },
                  { badge: 'Missing', badgeStyle: { background: 'rgba(239,68,68,0.15)', color: '#f87171' }, text: 'Kubernetes orchestration experience', last: false },
                  { badge: 'Missing', badgeStyle: { background: 'rgba(239,68,68,0.15)', color: '#f87171' }, text: 'Payments infrastructure background', last: true },
                ].map(({ badge, badgeStyle, text, last }, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '8px 0',
                      borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.04)',
                      fontSize: '12px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        borderRadius: '4px',
                        padding: '2px 7px',
                        flexShrink: 0,
                        marginTop: '1px',
                        ...badgeStyle,
                      }}
                    >
                      {badge}
                    </span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: AI-tailored resume output */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '10px 16px',
                borderBottom: '1px solid rgba(124,58,237,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                ✦ AI-Tailored Resume Output
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(34,197,94,0.12)',
                  border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: '20px',
                  padding: '3px 10px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#4ade80',
                }}
              >
                <svg width="10" height="10" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                ATS Optimized
              </span>
            </div>
            <div style={{ padding: '18px', fontSize: '12px', lineHeight: 1.65, color: '#d4d4d8' }}>
              {/* Name / contact */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#f4f4f5', marginBottom: '2px' }}>Jane Smith</div>
                <div style={{ fontSize: '11px', color: '#71717a' }}>jane@example.com · github.com/jsmith · San Francisco, CA</div>
              </div>

              {/* Experience section */}
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Experience
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 700, color: '#e4e4e7', fontSize: '13px' }}>Senior Software Engineer — Cloudflare</div>
                <div style={{ fontSize: '11px', color: '#71717a', marginBottom: '5px' }}>2019 – Present</div>
                <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
                  {'• Designed and operated '}
                  <span style={{ color: '#c084fc', fontWeight: 600 }}>distributed systems</span>
                  {' handling 50M+ req/s across 200 PoPs'}
                  <br />
                  {'• Led migration of core routing service to '}
                  <span style={{ color: '#c084fc', fontWeight: 600 }}>Go</span>
                  {', reducing latency by 40%'}
                  <br />
                  {'• Architected '}
                  <span style={{ color: '#c084fc', fontWeight: 600 }}>Kubernetes</span>
                  {'-based deployment pipeline for 300+ microservices'}
                  <br />
                  {'• Drove '}
                  <span style={{ color: '#c084fc', fontWeight: 600 }}>system design</span>
                  {' for global anycast infrastructure at scale'}
                </div>
              </div>

              {/* Skills section */}
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['Go', 'Kubernetes', 'Distributed Systems'].map((skill) => (
                  <span
                    key={skill}
                    style={{
                      background: 'rgba(124,58,237,0.15)',
                      border: '1px solid rgba(124,58,237,0.25)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      color: '#c084fc',
                    }}
                  >
                    {skill}
                  </span>
                ))}
                {['Rust', 'PostgreSQL'].map((skill) => (
                  <span
                    key={skill}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      color: '#71717a',
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(124,58,237,0.08)', margin: 0 }} />

      {/* ── COVER LETTER SECTION ── */}
      <section style={{ padding: '72px 40px', maxWidth: '1000px', margin: '0 auto' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#7c3aed',
            marginBottom: '12px',
          }}
        >
          Cover Letter
        </div>
        <div
          style={{
            fontSize: '32px',
            fontWeight: 800,
            letterSpacing: '-1px',
            color: '#f4f4f5',
            marginBottom: '14px',
            lineHeight: 1.15,
          }}
        >
          A tailored cover letter,
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #a855f7, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            generated instantly
          </span>
        </div>
        <p style={{ fontSize: '15px', color: '#71717a', maxWidth: '480px', lineHeight: 1.6, marginBottom: '40px' }}>
          Not a generic template. Every letter is written to the specific role, company, and your experience.
        </p>

        {/* Cover letter card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(124,58,237,0.18)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(124,58,237,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(124,58,237,0.15)',
                  border: '1px solid rgba(124,58,237,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#a855f7" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#e4e4e7' }}>
                  Cover Letter — Stripe · Senior Software Engineer
                </div>
                <div style={{ fontSize: '11px', color: '#71717a', marginTop: '1px' }}>
                  Generated in 18s · Tone: Professional · 3 paragraphs
                </div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(124,58,237,0.12)',
                border: '1px solid rgba(124,58,237,0.25)',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#a855f7',
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </div>
          </div>

          {/* Body: 2 columns */}
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
            {/* Cover letter text */}
            <div style={{ fontSize: '12.5px', lineHeight: 1.75, color: '#a1a1aa' }}>
              <p style={{ marginBottom: '12px' }}>Dear Stripe Hiring Team,</p>
              <p style={{ marginBottom: '12px' }}>
                {`I'm excited to apply for the Senior Software Engineer role on your infrastructure team. Having spent the past six years building `}
                <strong style={{ color: '#e4e4e7' }}>distributed systems at Cloudflare</strong>
                {` — serving over 50 million requests per second across 200 points of presence — I believe my background maps closely to the scale and reliability challenges Stripe faces in its payments infrastructure.`}
              </p>
              <p style={{ marginBottom: '12px' }}>
                {`Most recently, I led the migration of our core routing service from C++ to `}
                <strong style={{ color: '#e4e4e7' }}>Go</strong>
                {`, cutting tail latency by 40% while maintaining five-nines availability. I also architected our Kubernetes-based deployment pipeline, consolidating 300+ microservices onto a unified platform. These experiences have given me a deep appreciation for the engineering discipline required to run financial-grade infrastructure.`}
              </p>
              <p style={{ marginBottom: '12px' }}>
                {`I'd love the opportunity to bring this experience to Stripe and help build the infrastructure that powers the internet economy. Thank you for your consideration.`}
              </p>
              <p style={{ color: '#71717a' }}>
                Best,
                <br />
                <strong style={{ color: '#e4e4e7' }}>Jane Smith</strong>
              </p>
            </div>

            {/* Metadata cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Company matched */}
              <div
                style={{
                  background: 'rgba(124,58,237,0.08)',
                  border: '1px solid rgba(124,58,237,0.18)',
                  borderRadius: '12px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '6px' }}>
                  Company matched
                </div>
                <div style={{ fontSize: '13px', color: '#e4e4e7', fontWeight: 600 }}>Stripe</div>
              </div>

              {/* Role matched */}
              <div
                style={{
                  background: 'rgba(124,58,237,0.08)',
                  border: '1px solid rgba(124,58,237,0.18)',
                  borderRadius: '12px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '6px' }}>
                  Role matched
                </div>
                <div style={{ fontSize: '13px', color: '#e4e4e7', fontWeight: 600 }}>Senior Software Engineer</div>
              </div>

              {/* Tone */}
              <div
                style={{
                  background: 'rgba(124,58,237,0.08)',
                  border: '1px solid rgba(124,58,237,0.18)',
                  borderRadius: '12px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '6px' }}>
                  Tone
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                  {[
                    { label: 'Professional', active: true },
                    { label: 'Conversational', active: false },
                    { label: 'Concise', active: false },
                  ].map(({ label, active }) => (
                    <span
                      key={label}
                      style={{
                        background: active ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${active ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '20px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        color: active ? '#c084fc' : '#a1a1aa',
                      }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Keywords */}
              <div
                style={{
                  background: 'rgba(124,58,237,0.08)',
                  border: '1px solid rgba(124,58,237,0.18)',
                  borderRadius: '12px',
                  padding: '14px',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#7c3aed', marginBottom: '6px' }}>
                  Keywords included
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
                  {['distributed systems', 'Go', 'Kubernetes', 'five-nines'].map((kw) => (
                    <span
                      key={kw}
                      style={{
                        background: 'rgba(124,58,237,0.15)',
                        border: '1px solid rgba(168,85,247,0.3)',
                        borderRadius: '20px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        color: '#c084fc',
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr style={{ border: 'none', borderTop: '1px solid rgba(124,58,237,0.08)', margin: 0 }} />

      {/* ── FEATURE CARDS ── */}
      <section style={{ padding: '72px 40px', maxWidth: '1000px', margin: '0 auto' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#7c3aed',
            marginBottom: '12px',
          }}
        >
          Features
        </div>
        <div
          style={{
            fontSize: '32px',
            fontWeight: 800,
            letterSpacing: '-1px',
            color: '#f4f4f5',
            marginBottom: '14px',
            lineHeight: 1.15,
          }}
        >
          Everything you need
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #a855f7, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            to get the interview
          </span>
        </div>
        <p style={{ fontSize: '15px', color: '#71717a', maxWidth: '480px', lineHeight: 1.6, marginBottom: '32px' }}>
          Built for job seekers who apply seriously.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {[
            {
              icon: (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
              title: 'Gap Analysis',
              desc: 'See exactly what the JD requires that your resume lacks, scored by importance level.',
            },
            {
              icon: (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
              title: 'AI Resume Rewrite',
              desc: 'Streams a tailored, ATS-optimized resume in real time. Edit live before downloading.',
            },
            {
              icon: (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
              title: 'Cover Letter',
              desc: 'Generates a targeted cover letter matched to the company, role, and your background.',
            },
            {
              icon: (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ),
              title: 'PDF Export',
              desc: 'Vector, selectable, ATS-parseable PDF. Download resume and cover letter in one click.',
            },
            {
              icon: (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              title: 'Application History',
              desc: 'Every tailored resume saved automatically. Review, re-download, or iterate on past applications.',
            },
            {
              icon: (
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              ),
              title: 'English & Chinese',
              desc: 'Generate resumes and cover letters in English or Simplified Chinese, with proper typography.',
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(124,58,237,0.15)',
                borderRadius: '14px',
                padding: '22px',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(124,58,237,0.12)',
                  border: '1px solid rgba(124,58,237,0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '14px',
                  color: '#a855f7',
                }}
              >
                {icon}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#e4e4e7', marginBottom: '6px' }}>{title}</div>
              <div style={{ fontSize: '12px', color: '#71717a', lineHeight: 1.55 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '72px 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          borderTop: '1px solid rgba(124,58,237,0.08)',
        }}
      >
        {/* Bottom radial glow */}
        <div
          style={{
            position: 'absolute',
            bottom: '-60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.2) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        <h2
          style={{
            fontSize: '36px',
            fontWeight: 800,
            letterSpacing: '-1px',
            color: '#f4f4f5',
            marginBottom: '14px',
            position: 'relative',
          }}
        >
          Ready to land your
          <br />
          <span
            style={{
              background: 'linear-gradient(135deg, #a855f7, #c084fc)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            next interview?
          </span>
        </h2>
        <p style={{ fontSize: '15px', color: '#71717a', marginBottom: '32px', position: 'relative' }}>
          Join thousands of job seekers applying smarter.
        </p>

        <div style={{ position: 'relative' }}>
          <SignInButton />
        </div>

        <p style={{ fontSize: '12px', color: '#52525b', marginTop: '12px', position: 'relative' }}>
          No credit card · Cancel anytime
        </p>
      </div>

    </div>
  );
}
