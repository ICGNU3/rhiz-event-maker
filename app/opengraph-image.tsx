import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'EventManage.ai - Design Identity-Aware Event Experiences';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0f172a 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            display: 'flex',
          }}
        />

        {/* Glowing orbs */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)',
            filter: 'blur(40px)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '15%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)',
            filter: 'blur(50px)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '30%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
            filter: 'blur(30px)',
            display: 'flex',
          }}
        />

        {/* Network nodes visualization */}
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Node circles with connections visualization */}
          <svg
            width="1200"
            height="630"
            style={{ position: 'absolute', opacity: 0.6 }}
          >
            {/* Connection lines */}
            <line x1="200" y1="150" x2="400" y2="250" stroke="url(#gradient1)" strokeWidth="2" />
            <line x1="400" y1="250" x2="700" y2="180" stroke="url(#gradient1)" strokeWidth="2" />
            <line x1="700" y1="180" x2="1000" y2="280" stroke="url(#gradient1)" strokeWidth="2" />
            <line x1="200" y1="480" x2="500" y2="400" stroke="url(#gradient2)" strokeWidth="2" />
            <line x1="500" y1="400" x2="800" y2="500" stroke="url(#gradient2)" strokeWidth="2" />
            <line x1="400" y1="250" x2="500" y2="400" stroke="url(#gradient1)" strokeWidth="1.5" />
            <line x1="700" y1="180" x2="800" y2="500" stroke="url(#gradient2)" strokeWidth="1.5" />
            <line x1="150" y1="300" x2="400" y2="250" stroke="url(#gradient1)" strokeWidth="1.5" />
            <line x1="1050" y1="400" x2="800" y2="500" stroke="url(#gradient2)" strokeWidth="1.5" />
            
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            
            {/* Nodes */}
            <circle cx="200" cy="150" r="12" fill="#10b981">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="400" cy="250" r="16" fill="#06b6d4">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="700" cy="180" r="14" fill="#10b981">
              <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="1000" cy="280" r="10" fill="#06b6d4">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="3.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="200" cy="480" r="11" fill="#8b5cf6">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2.8s" repeatCount="indefinite" />
            </circle>
            <circle cx="500" cy="400" r="15" fill="#10b981">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="800" cy="500" r="13" fill="#06b6d4">
              <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="150" cy="300" r="9" fill="#8b5cf6">
              <animate attributeName="opacity" values="0.5;1;0.5" dur="2.6s" repeatCount="indefinite" />
            </circle>
            <circle cx="1050" cy="400" r="11" fill="#10b981">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* Content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            textAlign: 'center',
            padding: '40px',
          }}
        >
          {/* Logo/Brand mark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Main title */}
          <div
            style={{
              fontSize: '72px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 50%, #c4b5fd 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-2px',
              lineHeight: 1.1,
              display: 'flex',
              marginBottom: '16px',
            }}
          >
            EventManage.ai
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: '28px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.8)',
              letterSpacing: '-0.5px',
              display: 'flex',
              marginBottom: '32px',
            }}
          >
            Design Identity-Aware Event Experiences
          </div>

          {/* Feature pills */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
            }}
          >
            <div
              style={{
                padding: '10px 20px',
                borderRadius: '50px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                fontSize: '16px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ display: 'flex' }}>✦</span> AI-Powered
            </div>
            <div
              style={{
                padding: '10px 20px',
                borderRadius: '50px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#06b6d4',
                fontSize: '16px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ display: 'flex' }}>◎</span> Network Matching
            </div>
            <div
              style={{
                padding: '10px 20px',
                borderRadius: '50px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: '#8b5cf6',
                fontSize: '16px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ display: 'flex' }}>⬡</span> Rhiz Protocol
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(transparent, rgba(10, 10, 26, 0.8))',
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
