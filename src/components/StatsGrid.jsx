import { useApp } from '../context/AppContext'

export default function StatsGrid() {
  const { stats } = useApp()

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon epicas">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
            <polyline points="2 17 12 22 22 17"/>
            <polyline points="2 12 12 17 22 12"/>
          </svg>
        </div>
        <div className="stat-info">
          <div className="stat-val">{stats.epicas}</div>
          <div className="stat-lbl">Épicas</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon historias">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
          </svg>
        </div>
        <div className="stat-info">
          <div className="stat-val">{stats.historias}</div>
          <div className="stat-lbl">Historias</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon sp">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        <div className="stat-info">
          <div className="stat-val">{stats.sp}</div>
          <div className="stat-lbl">Story Points</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon sprints">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8"  y1="2" x2="8"  y2="6"/>
            <line x1="3"  y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div className="stat-info">
          <div className="stat-val">{stats.sprints}</div>
          <div className="stat-lbl">Sprints</div>
        </div>
      </div>
    </div>
  )
}
