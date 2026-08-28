const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

code = code.replace(
  "import { format, startOfDay, endOfDay } from 'date-fns';",
  "import { format, startOfDay, endOfDay, subDays } from 'date-fns';"
);

code = code.replace(
  "import { Calendar, Users, Scissors, Loader2, ArrowRight } from 'lucide-react';",
  "import { Calendar, Users, Scissors, Loader2, ArrowRight, TrendingUp } from 'lucide-react';\nimport { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';"
);

code = code.replace(
  "export const AdminDashboard = () => {",
  "interface ChartData { date: string; revenue: number; }\n\nexport const AdminDashboard = () => {"
);

code = code.replace(
  "revenueToday: 0\n  });",
  "revenueToday: 0\n  });\n  const [chartData, setChartData] = useState<ChartData[]>([]);"
);

const fetchToday = `        // Fetch appointments for today
        const { data: appointments } = await supabase
          .from('appointments')
          .select('id, status, service:services(price)')
          .gte('start_datetime', start)
          .lte('start_datetime', end);`;

const fetchWithRecent = `        const sevenDaysAgo = startOfDay(subDays(today, 6)).toISOString();
        
        // Fetch appointments for the last 7 days
        const { data: recentAppointments } = await supabase
          .from('appointments')
          .select('start_datetime, status, service:services(price)')
          .gte('start_datetime', sevenDaysAgo)
          .lte('start_datetime', endOfDay(today).toISOString());

` + fetchToday;

code = code.replace(fetchToday, fetchWithRecent);


const calcRevenue = `        setStats({
          appointmentsToday,`;

const calcWithChart = `        // Calculate chart data
        const dailyRevenue: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
          const date = format(subDays(today, i), 'dd/MM');
          dailyRevenue[date] = 0;
        }
        
        if (recentAppointments) {
          recentAppointments.forEach(app => {
            if (app.status !== 'CANCELLED' && app.service && !Array.isArray(app.service)) {
              const dayStr = format(new Date(app.start_datetime), 'dd/MM');
              if (dailyRevenue[dayStr] !== undefined) {
                dailyRevenue[dayStr] += Number((app.service as any).price || 0);
              }
            }
          });
        }
        setChartData(Object.keys(dailyRevenue).map(date => ({ date, revenue: dailyRevenue[date] })));

` + calcRevenue;

code = code.replace(calcRevenue, calcWithChart);

const uiReplace = `      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-2">Acesso Rápido</h2>`;

const newUI = `      {/* Charts Section */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Faturamento (Últimos 7 dias)</h2>
            <p className="text-sm text-zinc-500">Evolução de receita da barbearia.</p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#18181b" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(value) => \`R$\${value}\`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#18181b', fontWeight: 600 }}
                formatter={(value) => [\`R$ \${Number(value).toFixed(2)}\`, 'Receita']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#18181b" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 mb-2">Acesso Rápido</h2>`;

code = code.replace(uiReplace, newUI);

fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', code);
