import Homepage from './pages/Homepage';
import UpgradePage from './pages/UpgradePage';
import DiferenciaisPage from './pages/DiferenciaisPage';
import CiclosPage from './pages/CiclosPage';
import EspecializacoesPage from './pages/EspecializacoesPage';
import CoordenadorPage from './pages/CoordenadorPage';
import ProfessoresPage from './pages/ProfessoresPage';
import EmAcaoPage from './pages/EmAcaoPage';
import InscricoesMatriculasPage from './pages/InscricoesMatriculasPage';
import AdminPage from './pages/AdminPage';
import ParceirosPage from './pages/ParceirosPage';
import Documentation from './pages/Documentation';
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
    "InscricoesMatriculasPage": InscricoesMatriculasPage,
    "AdminPage": AdminPage,
    "ParceirosPage": ParceirosPage,
    "Documentation": Documentation,
}

export const pagesConfig = {
    mainPage: "Homepage",
    Pages: PAGES,
    Layout: __Layout,
};