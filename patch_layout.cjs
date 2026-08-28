const fs = require('fs');

// 1. CustomerLayout
let custCode = fs.readFileSync('src/components/layout/CustomerLayout.tsx', 'utf8');
custCode = custCode.replace(
  "import { Scissors, LogOut, Calendar, Plus } from 'lucide-react';",
  "import { Scissors, LogOut, Calendar, Plus, User } from 'lucide-react';"
);

const custTarget = `<button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>`;
const custRep = `<NavLink
              to="/customer/profile"
              className={({ isActive }) => \`p-2 rounded-full transition-colors \${isActive ? 'text-zinc-900 bg-zinc-100' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50'}\`}
              title="Meu Perfil"
            >
              <User className="w-5 h-5" />
            </NavLink>
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>`;
custCode = custCode.replace(custTarget, custRep);
fs.writeFileSync('src/components/layout/CustomerLayout.tsx', custCode);


// 2. BarberLayout
let barbCode = fs.readFileSync('src/components/layout/BarberLayout.tsx', 'utf8');
barbCode = barbCode.replace(
  "import { Calendar, LogOut, Scissors, Clock } from 'lucide-react';",
  "import { Calendar, LogOut, Scissors, Clock, User } from 'lucide-react';"
);

const barbTarget = "    { icon: Clock, label: 'Ausências e Bloqueios', path: '/barber/time-offs' },";
const barbRep = "    { icon: Clock, label: 'Ausências e Bloqueios', path: '/barber/time-offs' },\n    { icon: User, label: 'Meu Perfil', path: '/barber/profile' },";
barbCode = barbCode.replace(barbTarget, barbRep);
fs.writeFileSync('src/components/layout/BarberLayout.tsx', barbCode);

// 3. AdminLayout
let adminCode = fs.readFileSync('src/components/layout/AdminLayout.tsx', 'utf8');
adminCode = adminCode.replace(
  "import { LayoutDashboard, Scissors, Users, Calendar, LogOut } from 'lucide-react';",
  "import { LayoutDashboard, Scissors, Users, Calendar, LogOut, User } from 'lucide-react';"
);

const adminTarget = "    { icon: Calendar, label: 'Horários', path: '/admin/schedule' },";
const adminRep = "    { icon: Calendar, label: 'Horários', path: '/admin/schedule' },\n    { icon: User, label: 'Meu Perfil', path: '/admin/profile' },";
adminCode = adminCode.replace(adminTarget, adminRep);
fs.writeFileSync('src/components/layout/AdminLayout.tsx', adminCode);

