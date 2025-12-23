import AdminPage from './pages/AdminPage';
import CalendarioDeAula from './pages/CalendarioDeAula';
import CiclosPage from './pages/CiclosPage';
import CoordenadorPage from './pages/CoordenadorPage';
import CorpoDiscentePage from './pages/CorpoDiscentePage';
import DepoimentosPage from './pages/DepoimentosPage';
import Documentation from './pages/Documentation';
import EmAcaoPage from './pages/EmAcaoPage';
import EspecializacoesPage from './pages/EspecializacoesPage';
import GerenciadorDeMidiaPage from './pages/GerenciadorDeMidiaPage';
import Home from './pages/Home';
import Homepage from './pages/Homepage';
import IncubadoraProfissionalPage from './pages/IncubadoraProfissionalPage';
import MeuPerfilDiscente from './pages/MeuPerfilDiscente';
import MeuPerfilDocente from './pages/MeuPerfilDocente';
import ParceirosPage from './pages/ParceirosPage';
import PerfilDiscente from './pages/PerfilDiscente';
import PerfilDocente from './pages/PerfilDocente';
import ProfessoresPage from './pages/ProfessoresPage';
import UpgradePage from './pages/UpgradePage';
import UserProfilePage from './pages/UserProfilePage';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminPage": AdminPage,
    "CalendarioDeAula": CalendarioDeAula,
    "CiclosPage": CiclosPage,
    "CoordenadorPage": CoordenadorPage,
    "CorpoDiscentePage": CorpoDiscentePage,
    "DepoimentosPage": DepoimentosPage,
    "Documentation": Documentation,
    "EmAcaoPage": EmAcaoPage,
    "EspecializacoesPage": EspecializacoesPage,
    "GerenciadorDeMidiaPage": GerenciadorDeMidiaPage,
    "Home": Home,
    "Homepage": Homepage,
    "IncubadoraProfissionalPage": IncubadoraProfissionalPage,
    "MeuPerfilDiscente": MeuPerfilDiscente,
    "MeuPerfilDocente": MeuPerfilDocente,
    "ParceirosPage": ParceirosPage,
    "PerfilDiscente": PerfilDiscente,
    "PerfilDocente": PerfilDocente,
    "ProfessoresPage": ProfessoresPage,
    "UpgradePage": UpgradePage,
    "UserProfilePage": UserProfilePage,
}

export const pagesConfig = {
    mainPage: "Homepage",
    Pages: PAGES,
    Layout: __Layout,
};