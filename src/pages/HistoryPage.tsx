import { useGameStore } from '@/store/gameStore';
import { BarChart3, Download, Trash2 } from 'lucide-react';

export function HistoryPage() {
  const { history } = useGameStore();

  const exportCSV = () => {
    const rows = [['Date', 'BrainScore', 'Games Played']];
    history.forEach(h => {
      rows.push([h.date, String(h.brainScore), String(h.results.length)]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brainscore-history.csv';
    a.click();
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <BarChart3 className="h-3.5 w-3.5" />
          BrainScore History
        </div>
        {history.length > 0 && (
          <button onClick={exportCSV} className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
            <Download className="h-3 w-3" /> CSV
          </button>
        )}
      </div>
      
      <div className="rounded-xl border border-border bg-card p-4">
        {history.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No history yet. Play games and save your score!</p>
        ) : (
          <div className="space-y-0">
            {history.map((entry, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border py-3 last:border-0">
                <div>
                  <span className="text-xs text-muted-foreground">{entry.date}</span>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{entry.results.length} games played</div>
                </div>
                <span className="font-display text-lg font-bold text-accent">{entry.brainScore}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
