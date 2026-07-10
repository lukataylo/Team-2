// ponytail: fake checkout screen built from divs — no image assets, no design tool needed for a demo.

export default function DesignMockup({ variant }) {
  const flawed = variant === 'decoy'
  return (
    <div className={`mockup ${flawed ? 'mockup--decoy' : 'mockup--boss'}`}>
      <div className="mockup__nav">
        <span className="mockup__logo">SHOPLY</span>
        <span className={flawed ? 'mockup__navlink mockup__navlink--tiny' : 'mockup__navlink'}>Cart (2)</span>
      </div>
      <div className="mockup__body">
        <div className="mockup__title" style={flawed ? { fontSize: '11px' } : undefined}>Checkout</div>
        <div className="mockup__field" />
        <div className="mockup__field" style={flawed ? { width: '30%' } : undefined} />
        <div className={flawed ? 'mockup__checkbox mockup__checkbox--tiny' : 'mockup__checkbox'} />
        <p className="mockup__fine" style={flawed ? { lineHeight: 1, letterSpacing: '-0.5px' } : undefined}>
          By continuing you agree to the terms of service and privacy policy and refund policy and shipping policy.
        </p>
        <button
          className="mockup__cta"
          style={flawed ? { background: '#eee', color: '#ccc' } : undefined}
        >
          Place order — $84.00
        </button>
      </div>
    </div>
  )
}
