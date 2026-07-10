// ponytail: hand-rolled confetti, a dozen styled divs — not worth a dependency for one burst.

const COLORS = ['#000000', '#4a4a4a', '#9a9a9a', '#ffffff']

export default function Confetti({ count = 60 }) {
  const pieces = Array.from({ length: count }, (_, i) => ({
    left: (i * 97) % 100,
    delay: (i % 12) * 0.08,
    duration: 2.2 + (i % 5) * 0.3,
    color: COLORS[i % COLORS.length],
    rotate: (i * 53) % 360,
  }))
  return (
    <div className="confetti">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti__piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  )
}
