import Homepage from './pages/Homepage';
import UpgradePage from './pages/UpgradePage';
import CiclosPage from './pages/CiclosPage';
import EspecializacoesPage from './pages/EspecializacoesPage';
import CoordenadorPage from './pages/CoordenadorPage';
import ProfessoresPage from './pages/ProfessoresPage';
import EmAcaoPage from './pages/EmAcaoPage';
import AdminPage from './pages/AdminPage';
import ParceirosPage from './pages/ParceirosPage';
import Documentation from './pages/Documentation';
import CorpoDiscentePage from './pages/CorpoDiscentePage';
import CalendarioDeAula from './pages/CalendarioDeAula';
import IncubadoraProfissionalPage from './pages/IncubadoraProfissionalPage';
import GerenciadorDeMidiaPage from './pages/GerenciadorDeMidiaPage';
import DepoimentosPage from './pages/DepoimentosPage';
import MeuPerfilDiscente from './pages/MeuPerfilDiscente';
import MeuPerfilDocente from './pages/MeuPerfilDocente';
import PerfilDocente from './pages/PerfilDocente';
import PerfilDiscente from './pages/PerfilDiscente';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Homepage": Homepage,
    "UpgradePage": UpgradePage,
    "CiclosPage": CiclosPage,
    "EspecializacoesPage": EspecializacoesPage,
    "CoordenadorPage": CoordenadorPage,
    "ProfessoresPage": ProfessoresPage,
    "EmAcaoPage": EmAcaoPage,
    "AdminPage": AdminPage,
    "ParceirosPage": ParceirosPage,
    "Documentation": Documentation,
    "CorpoDiscentePage": CorpoDiscentePage,
    "CalendarioDeAula": CalendarioDeAula,
    "IncubadoraProfissionalPage": IncubadoraProfissionalPage,
    "GerenciadorDeMidiaPage": GerenciadorDeMidiaPage,
    "DepoimentosPage": DepoimentosPage,
    "MeuPerfilDiscente": MeuPerfilDiscente,
    "MeuPerfilDocente": MeuPerfilDocente,
    "PerfilDocente": PerfilDocente,
    "PerfilDiscente": PerfilDiscente,
}

export const pagesConfig = {
    mainPage: "Homepage",
    Pages: PAGES,
    Layout: __Layout,
};