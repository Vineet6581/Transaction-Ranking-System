/** Admin system logs — login, signup, transactions, admin actions, warnings, errors. */
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle, AlertTriangle, Info, Shield, LogIn, UserPlus, ArrowUpDown } from 'lucide-react';
import { Card } from '../../components/Card';
import { Badge } from '../../components/UI';
import { Loader } from '../../components/Loader';
import { Pagination } from '../../components/admin/Pagination';
import { adminApi } from '../../lib/api';
import type { AdminLogEntry } from '../../types';
import { formatDateTime } from '../../lib/utils';

const levelConfig: Record<string, { variant: 'success' | 'error' | 'warning' | 'info' | 'purple'; icon: typeof Info }> = {
  info: { variant: 'info', icon: Info },
  warning: { variant: 'warning', icon: AlertTriangle },
  error: { variant: 'error', icon: AlertCircle },
};

const categoryIcons: Record<string, typeof Info> = {
  login: LogIn,
  signup: UserPlus,
  transaction: ArrowUpDown,
  admin: Shield,
  system: AlertCircle,
};

const CATEGORIES = ['', 'login', 'signup', 'transaction', 'admin', 'system'];
const LEVELS = ['', 'info', 'warning', 'error'];

export default function AdminLogs() {
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getLogs({
        search: search || undefined,
        category: category || undefined,
        level: level || undefined,
        page,
        pageSize,
      });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } finally {
      setLoading(false);
    }
  }, [search, category, level, page]);

  useEffect(() => { void load(); }, [load]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search logs..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/30"
            />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm">
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c ? c.charAt(0).toUpperCase() + c.slice(1) : 'All Categories'}</option>
            ))}
          </select>
          <select value={level} onChange={e => { setLevel(e.target.value); setPage(1); }} className="px-3 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm">
            {LEVELS.map(l => (
              <option key={l} value={l}>{l ? l.charAt(0).toUpperCase() + l.slice(1) : 'All Levels'}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="p-4">
        {loading ? (
          <div className="p-8"><Loader /></div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => {
              const cfg = levelConfig[log.level] ?? levelConfig.info;
              const LevelIcon = cfg.icon;
              const CatIcon = categoryIcons[log.category] ?? Info;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors border border-transparent hover:border-gray-100 dark:hover:border-white/5"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    log.level === 'error' ? 'bg-red-50 dark:bg-red-500/10' :
                    log.level === 'warning' ? 'bg-amber-50 dark:bg-amber-500/10' :
                    'bg-blue-50 dark:bg-blue-500/10'
                  }`}>
                    <LevelIcon size={14} className={
                      log.level === 'error' ? 'text-red-500' :
                      log.level === 'warning' ? 'text-amber-500' : 'text-blue-500'
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant={cfg.variant}>{log.level}</Badge>
                      <Badge variant="default">
                        <CatIcon size={10} className="mr-1" />{log.category}
                      </Badge>
                      <span className="text-[10px] text-gray-400">{formatDateTime(log.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{log.message}</p>
                    {log.userEmail && (
                      <p className="text-[11px] text-gray-400 mt-1 font-mono">{log.userEmail}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        <div className="pt-4">
          <Pagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
