const VIEWS = [
  { id: 'dashboard',       label: 'Dashboard'       },
  { id: 'daily-log',       label: 'Daily Log'        },
  { id: 'daily-summary',   label: 'Daily Summary'    },
  { id: 'monthly-history', label: 'Monthly History'  },
  { id: 'budget-setup',    label: 'Budget Setup'     },
];

export default function Nav({ active, onNavigate, userEmail, onSignOut }) {
  return (
    <nav className="bg-navy text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center gap-0">
          <span className="text-accent font-bold text-lg mr-4 py-3 shrink-0">
            💰 Budget
          </span>
          <div className="flex items-center gap-0 overflow-x-auto flex-1">
            {VIEWS.map(v => (
              <button
                key={v.id}
                onClick={() => onNavigate(v.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  active === v.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-400'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          {(userEmail || onSignOut) && (
            <div className="flex items-center gap-3 ml-4 shrink-0 pl-4 border-l border-white/10">
              {userEmail && (
                <span className="text-xs text-gray-400 hidden sm:block max-w-[160px] truncate">
                  {userEmail}
                </span>
              )}
              <button
                onClick={onSignOut}
                className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {userEmail ? 'Sign out' : 'Reset'}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
