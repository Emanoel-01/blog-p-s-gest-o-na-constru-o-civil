import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Home, Award, Lightbulb, GitMerge, GraduationCap, User, Users, Handshake, Rss, CalendarDays, Settings, Menu, X, Star, LogIn, LogOut, UserCircle } from 'lucide-react';
import Chatbot from '@/components/chatbot/Chatbot';

export default function Layout({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setIsAdmin(currentUser && currentUser.role === 'admin');
      } catch (error) {
        console.error("Erro ao verificar status de admin:", error);
        setUser(null);
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
    { name: 'Ciclos', path: 'CiclosPage' },
    { name: 'Especializações', path: 'EspecializacoesPage' },
    { name: 'Coordenação', path: 'CoordenadorPage' },
    { name: 'Corpo Docente', path: 'ProfessoresPage' },
    { name: 'Corpo Discente', path: 'CorpoDiscentePage' },
    { name: 'Parceiros', path: 'ParceirosPage' },
    { name: 'Incubadora', path: 'IncubadoraProfissionalPage' },
    { name: 'Blog', path: 'EmAcaoPage' },
    { name: 'Calendário', path: 'CalendarioDeAula' },
    { name: 'Depoimentos', path: 'DepoimentosPage' }
    ];

  const icons = {
    'Home': Home,
    'O Upgrade': Award,
    'Ciclos': GitMerge,
    'Especializações': GraduationCap,
    'Coordenação': User,
    'Corpo Docente': Users,
    'Corpo Discente': GraduationCap,
    'Parceiros': Handshake,
    'Incubadora': Lightbulb,
    'Blog': Rss,
    'Calendário': CalendarDays,
    'Depoimentos': Star
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
      <Helmet htmlAttributes={{ lang: 'pt-BR' }}>
        <meta name="language" content="Portuguese" />
        <meta httpEquiv="content-language" content="pt-BR" />
      </Helmet>
      <div className="flex min-h-screen bg-gray-50">
        <style>{`
          .esuda-green { background: linear-gradient(135deg, #61b376 0%, #4a9960 100%); }
        `}</style>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg border border-gray-200"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
        </button>
        
        {/* Desktop Sidebar */}
        <div className="hidden md:flex fixed top-0 left-0 h-full w-16 lg:w-64 bg-white/20 backdrop-blur-md border-r border-white/30 z-50 flex-col items-center py-4 space-y-4 shadow-lg overflow-y-auto">
          <img
            src="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png"
            alt="ESUDA Logo"
            loading="eager"
            className="w-10 lg:w-28 mx-auto mb-4"
          />

        <nav className="flex flex-col w-full px-2 lg:px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = icons[item.name];
            const isActive = location.pathname.includes(item.path);
            return (
              <Link key={item.name} to={createPageUrl(item.path)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-sm lg:text-base transition-all duration-200
                    ${isActive ? 'esuda-green text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}
                    ${isActive ? 'lg:pl-4' : 'lg:pl-2'}`}
                >
                  <Icon className={`w-5 h-5 lg:mr-3 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  <span className="hidden lg:block">{item.name}</span>
                </Button>
              </Link>
            );
          })}
          {isAdmin && (
            <Link to={createPageUrl('AdminPage')}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-sm lg:text-base transition-all duration-200
                  ${location.pathname.includes('AdminPage') ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}
                  ${location.pathname.includes('AdminPage') ? 'lg:pl-4' : 'lg:pl-2'}`}
              >
                <Settings className={`w-5 h-5 lg:mr-3 ${location.pathname.includes('AdminPage') ? 'text-white' : 'text-gray-600'}`} />
                <span className="hidden lg:block">Administrador</span>
              </Button>
            </Link>
          )}

          {/* Botão de Login/Perfil */}
          <div className="border-t border-gray-300 pt-2 mt-2">
            {user ? (
              <>
                <Link to={createPageUrl('MeuPerfilDiscente')}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm lg:text-base transition-all duration-200
                      ${location.pathname.includes('MeuPerfilDiscente') ? 'bg-blue-100 text-blue-800 shadow-md' : 'text-gray-700 hover:bg-gray-100'}
                      ${location.pathname.includes('MeuPerfilDiscente') ? 'lg:pl-4' : 'lg:pl-2'}`}
                  >
                    <UserCircle className={`w-5 h-5 lg:mr-3 ${location.pathname.includes('MeuPerfilDiscente') ? 'text-blue-800' : 'text-gray-600'}`} />
                    <span className="hidden lg:block">Meu Perfil</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => base44.auth.logout()}
                  className="w-full justify-start text-sm lg:text-base text-gray-700 hover:bg-gray-100 lg:pl-2"
                >
                  <LogOut className="w-5 h-5 lg:mr-3 text-gray-600" />
                  <span className="hidden lg:block">Sair</span>
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                className="w-full justify-start text-sm lg:text-base text-gray-700 hover:bg-gray-100 lg:pl-2"
              >
                <LogIn className="w-5 h-5 lg:mr-3 text-gray-600" />
                <span className="hidden lg:block">Entrar</span>
              </Button>
            )}
          </div>
        </nav>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 flex flex-col py-4 space-y-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <img
              src="https://esuda.edu.br/wp-content/uploads/2024/01/cropped-cor-1000-x-474.png"
              alt="ESUDA Logo"
              loading="eager"
              className="w-28 mx-auto mb-4"
            />

            <nav className="flex flex-col w-full px-4 space-y-2">
              {navItems.map((item) => {
                const Icon = icons[item.name];
                const isActive = location.pathname.includes(item.path);
                return (
                  <Link key={item.name} to={createPageUrl(item.path)} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start text-base transition-all duration-200
                        ${isActive ? 'esuda-green text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
              {isAdmin && (
                <Link to={createPageUrl('AdminPage')} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-base transition-all duration-200
                      ${location.pathname.includes('AdminPage') ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Settings className={`w-5 h-5 mr-3 ${location.pathname.includes('AdminPage') ? 'text-white' : 'text-gray-600'}`} />
                    <span>Administrador</span>
                  </Button>
                </Link>
              )}

              {/* Botão de Login/Perfil Mobile */}
              <div className="border-t border-gray-300 pt-2 mt-2">
                {user ? (
                  <>
                    <Link to={createPageUrl('MeuPerfilDiscente')} onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start text-base transition-all duration-200
                          ${location.pathname.includes('MeuPerfilDiscente') ? 'bg-blue-100 text-blue-800 shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        <UserCircle className={`w-5 h-5 mr-3 ${location.pathname.includes('MeuPerfilDiscente') ? 'text-blue-800' : 'text-gray-600'}`} />
                        <span>Meu Perfil</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => base44.auth.logout()}
                      className="w-full justify-start text-base text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-5 h-5 mr-3 text-gray-600" />
                      <span>Sair</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                    className="w-full justify-start text-base text-gray-700 hover:bg-gray-100"
                  >
                    <LogIn className="w-5 h-5 mr-3 text-gray-600" />
                    <span>Entrar</span>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        </div>
        )}

        <main className="flex-1 md:ml-16 lg:ml-64 p-3 sm:p-4 md:p-8 pt-16 md:pt-8">
        <div className="bg-transparent mx-auto p-4 sm:p-6 md:p-8 opacity-100 rounded-2xl max-w-4xl shadow-xl">
          {children}
        </div>
      </main>
      
      <Chatbot />
      </div>
    </HelmetProvider>
  );
}