import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface RevenuePoint {
  date: string;
  revenue: number;
}

const brl = (value: number) =>
  Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-line bg-porcelain px-3.5 py-2.5 shadow-lift">
      <p className="type-tag text-ash">{label}</p>
      <p className="type-num mt-1.5 text-base font-medium text-ink">
        R$ {brl(payload[0].value ?? 0)}
      </p>
    </div>
  );
};

/**
 * Recharts é a dependência mais pesada do projeto — por isso o gráfico mora
 * num pedaço próprio, carregado só quando a administração abre o painel.
 */
const RevenueChart = ({ data }: { data: RevenuePoint[] }) => (
  <div className="h-64 w-full sm:h-72">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="cutflow-revenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bd8a2c" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#bd8a2c" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 6" vertical={false} stroke="#dbdfd4" />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          dy={10}
          tick={{ fontSize: 12, fill: '#8b948a', fontFamily: 'DM Mono, monospace' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          width={64}
          tick={{ fontSize: 12, fill: '#8b948a', fontFamily: 'DM Mono, monospace' }}
          tickFormatter={(value) => `R$ ${value}`}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#14392e', strokeOpacity: 0.25 }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#14392e"
          strokeWidth={2.5}
          fill="url(#cutflow-revenue)"
          dot={{ r: 3, fill: '#14392e', strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#bd8a2c', strokeWidth: 2, stroke: '#fff' }}
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default RevenueChart;
