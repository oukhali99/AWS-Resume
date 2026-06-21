import { useEffect, useRef, useState } from 'react';

type Props = { visitorCount: number | undefined };

const ArchitectureDiagram = ({ visitorCount }: Props) => {
  const [flash, setFlash] = useState(false);
  const prev = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (prev.current !== undefined && visitorCount !== undefined && visitorCount !== prev.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 700);
      return () => clearTimeout(t);
    }
    prev.current = visitorCount;
  }, [visitorCount]);

  return (
    <div className="diagram" aria-label="Live architecture diagram of this site">
      <span className="legend">↑ how this page reached you</span>
      <div className="counter">
        visitors
        <span className={`n${flash ? ' flash' : ''}`}>
          {visitorCount === undefined ? '—' : visitorCount.toLocaleString()}
        </span>
      </div>

      <svg viewBox="0 0 960 230" preserveAspectRatio="xMidYMid meet">
        {/* viewer */}
        <g transform="translate(20,80)">
          <circle className="node-box" cx="22" cy="22" r="22" />
          <text className="node-label" x="22" y="68" textAnchor="middle">you</text>
        </g>

        {/* viewer → cloudfront : the live request path */}
        <path className="signal-edge" d="M 64 102 L 180 102" />
        <text className="anno" x="100" y="92">GET /</text>

        {/* cloudfront */}
        <g transform="translate(180,72)">
          <rect className="node-box" width="120" height="60" rx="1" />
          <text className="node-label" x="60" y="28" textAnchor="middle">cloudfront</text>
          <text className="node-sub"   x="60" y="44" textAnchor="middle">edge · us-east-1</text>
          <text className="anno" x="60" y="80" textAnchor="middle">↓ tls · acm cert</text>
        </g>

        {/* cloudfront → s3 */}
        <path className="signal-edge" d="M 300 102 L 380 102" />

        {/* s3 */}
        <g transform="translate(380,72)">
          <rect className="node-box" width="140" height="60" rx="1" />
          <text className="node-label" x="70" y="28" textAnchor="middle">s3 · oac</text>
          <text className="node-sub"   x="70" y="44" textAnchor="middle">spa bundle</text>
        </g>

        {/* visitor-count branch (dashed grey, not on the main request path) */}
        <path className="edge-dim" d="M 240 132 L 240 180 L 540 180" />
        <text className="anno" x="245" y="200">POST /add-visitor</text>

        {/* api gateway */}
        <g transform="translate(540,160)">
          <rect className="node-box" width="120" height="40" rx="1" />
          <text className="node-label" x="60" y="25" textAnchor="middle">api gateway</text>
        </g>

        <path className="edge-dim" d="M 660 180 L 720 180" />

        {/* lambda */}
        <g transform="translate(720,160)">
          <rect className="node-box" width="100" height="40" rx="1" />
          <text className="node-label" x="50" y="25" textAnchor="middle">λ visitor</text>
        </g>

        {/* lambda → dynamo */}
        <path className="edge-dim" d="M 820 180 L 900 180 L 900 110 L 880 110" />

        {/* dynamodb */}
        <g transform="translate(740,72)">
          <rect className="node-box" width="140" height="60" rx="1" />
          <text className="node-label" x="70" y="28" textAnchor="middle">dynamodb</text>
          <text className="node-sub"   x="70" y="44" textAnchor="middle">visitor table</text>
        </g>

        <text className="anno" x="20" y="222">
          ↳ provisioned by terraform · deployed by codepipeline on every push to main
        </text>
      </svg>
    </div>
  );
};

export default ArchitectureDiagram;
