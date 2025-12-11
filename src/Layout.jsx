import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Home, Award, Lightbulb, GitMerge, GraduationCap, User, Users, Handshake, Rss, CalendarDays, Settings } from 'lucide-react';

export default function Layout({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const location = useLocation();

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const user = await base44.auth.me();
        setIsAdmin(user && user.role === 'admin');
      } catch (error) {
        console.error("Erro ao verificar status de admin:", error);
        setIsAdmin(false);
      } finally {
        setLoadingUser(false);
      }
    }
    checkAdminStatus();
  }, []);

  const navItems = [
    { name: 'Home', path: 'Homepage' },
    { name: 'O Upgrade', path: 'UpgradePage' },
    { name: 'Diferenciais', path: 'DiferenciaisPage' },
    { name: 'Ciclos de Conhecimento', path: 'CiclosPage' },
    { name: 'Especializações', path: 'EspecializacoesPage' },
    { name: 'Coordenação', path: 'CoordenadorPage' },
    { name: 'Corpo Docente', path: 'ProfessoresPage' },
    { name: 'Corpo Discente', path: 'CorpoDiscentePage' },
    { name: 'Parceiros', path: 'ParceirosPage' },
    { name: 'Incubadora Profissional', path: 'IncubadoraProfissionalPage' },
    { name: 'Blog', path: 'EmAcaoPage' },
    { name: 'Calendário de Aulas', path: 'CalendarioDeAula' }
  ];

  const icons = {
    'Home': Home,
    'O Upgrade': Award,
    'Diferenciais': Lightbulb,
    'Ciclos de Conhecimento': GitMerge,
    'Especializações': GraduationCap,
    'Coordenação': User,
    'Corpo Docente': Users,
    'Corpo Discente': GraduationCap,
    'Parceiros': Handshake,
    'Incubadora Profissional': Lightbulb,
    'Blog': Rss,
    'Calendário de Aulas': CalendarDays
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-700">
        Carregando...
      </div>
    );
  }

  return (
    <HelmetProvider>
      <div className="flex min-h-screen bg-gray-50">
        <style>{`
          .esuda-green { background: linear-gradient(135deg, #61b376 0%, #4a9960 100%); }
        `}</style>
        
        <div className="fixed top-0 left-0 h-full w-16 sm:w-20 md:w-64 bg-white/20 backdrop-blur-md border-r border-white/30 z-50 flex flex-col items-center py-4 space-y-4 shadow-lg overflow-y-auto">
          <img
            src="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png"
            alt="ESUDA Logo"
            className="w-10 sm:w-12 md:w-28 mx-auto mb-4"
          />

        <nav className="flex flex-col w-full px-2 md:px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = icons[item.name];
            const isActive = location.pathname.includes(item.path);
            return (
              <Link key={item.name} to={createPageUrl(item.path)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm md:text-base transition-all duration-200
                    ${isActive ? 'esuda-green text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}
                    ${isActive ? 'md:pl-4' : 'md:pl-2'}`}
                >
                  <Icon className={`w-5 h-5 md:mr-3 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  <span className="hidden md:block">{item.name}</span>
                </Button>
              </Link>
            );
          })}
          {isAdmin && (
            <Link to={createPageUrl('AdminPage')}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-sm md:text-base transition-all duration-200
                  ${location.pathname.includes('AdminPage') ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}
                  ${location.pathname.includes('AdminPage') ? 'md:pl-4' : 'md:pl-2'}`}
              >
                <Settings className={`w-5 h-5 md:mr-3 ${location.pathname.includes('AdminPage') ? 'text-white' : 'text-gray-600'}`} />
                <span className="hidden md:block">Administrador</span>
              </Button>
            </Link>
          )}
        </nav>
      </div>

      <main className="flex-1 ml-16 sm:ml-20 md:ml-64 p-3 sm:p-4 md:p-8">
        <div className="bg-transparent mx-auto p-4 sm:p-6 md:p-8 opacity-100 rounded-2xl max-w-4xl shadow-xl">
          {children}
        </div>
      </main>
      </div>
    </HelmetProvider>
  );
}