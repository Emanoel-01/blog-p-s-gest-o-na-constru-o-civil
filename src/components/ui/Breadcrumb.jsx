import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { createPageUrl } from '@/utils';

const routeMap = {
  '/': { title: 'Home', page: 'Homepage' },
  '/upgrade': { title: 'O Upgrade', page: 'UpgradePage' },
  '/diferenciais': { title: 'Diferenciais', page: 'DiferenciaisPage' },
  '/ciclos': { title: 'Ciclos de Conhecimento', page: 'CiclosPage' },
  '/especializacoes': { title: 'Especializações', page: 'EspecializacoesPage' },
  '/coordenador': { title: 'Coordenação', page: 'CoordenadorPage' },
  '/professores': { title: 'Corpo Docente', page: 'ProfessoresPage' },
  '/discentes': { title: 'Corpo Discente', page: 'CorpoDiscentePage' },
  '/parceiros': { title: 'Parceiros', page: 'ParceirosPage' },
  '/incubadora': { title: 'Incubadora Profissional', page: 'IncubadoraProfissionalPage' },
  '/blog': { title: 'Blog', page: 'EmAcaoPage' },
  '/calendario': { title: 'Calendário de Aulas', page: 'CalendarioDeAula' },
  '/admin': { title: 'Administrador', page: 'AdminPage' },
  '/gerenciador-midia': { title: 'Gerenciador de Mídia', page: 'GerenciadorDeMidiaPage' }
};

export default function Breadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const breadcrumbs = [{ title: 'Home', page: 'Homepage', path: '/' }];

  let currentPath = '';
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const route = routeMap[currentPath];
    if (route) {
      breadcrumbs.push({ ...route, path: currentPath });
    }
  });

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4 flex-wrap">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-gray-900 font-semibold">{crumb.title}</span>
          ) : (
            <Link 
              to={createPageUrl(crumb.page)} 
              className="hover:text-green-600 transition-colors flex items-center gap-1"
            >
              {index === 0 && <Home className="w-4 h-4" />}
              {crumb.title}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}