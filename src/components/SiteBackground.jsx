// Global animated background. Rendered once in <Home /> at position:fixed so
// the aurora / grid / floating emojis stay in view as the user scrolls.
export default function SiteBackground() {
  return (
    <div className="site-bg" aria-hidden="true">
      {/* Aurora blobs — spread across the viewport */}
      <div className="aurora">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="aurora-blob aurora-blob-4" />
      </div>

      {/* Masked grid */}
      <div className="hero-grid" />

      {/* Subtle dot pattern */}
      <div className="absolute inset-0 bg-hero-dots opacity-50 pointer-events-none" />

      {/* Floating emojis scattered across the viewport */}
      <span className="floating-emoji" style={{ left: '6%',  top: '12%', animationDelay: '0s'    }}>🍣</span>
      <span className="floating-emoji" style={{ left: '88%', top: '8%',  animationDelay: '-3s'   }}>🐟</span>
      <span className="floating-emoji" style={{ left: '14%', top: '46%', animationDelay: '-6s'   }}>🥢</span>
      <span className="floating-emoji" style={{ left: '82%', top: '54%', animationDelay: '-9s'   }}>🍵</span>
      <span className="floating-emoji" style={{ left: '50%', top: '30%', animationDelay: '-1.5s' }}>🍱</span>
      <span className="floating-emoji" style={{ left: '8%',  top: '82%', animationDelay: '-4.5s' }}>🍤</span>
      <span className="floating-emoji" style={{ left: '92%', top: '88%', animationDelay: '-7.5s' }}>🍡</span>
      <span className="floating-emoji" style={{ left: '44%', top: '92%', animationDelay: '-10.5s'}}>🥟</span>
    </div>
  );
}
