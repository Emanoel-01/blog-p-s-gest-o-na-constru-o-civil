import Homepage from './pages/Homepage';
import UpgradePage from './pages/UpgradePage';
import DiferenciaisPage from './pages/DiferenciaisPage';
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
import __Layout from './Layout.jsx';


export const PAGES = {
    "Homepage": Homepage,
    "UpgradePage": UpgradePage,
    "DiferenciaisPage": DiferenciaisPage,
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
}

export const pagesConfig = {
    mainPage: "Homepage",
    Pages: PAGES,
    Layout: __Layout,
};