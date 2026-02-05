/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminPage from './pages/AdminPage';
import AplicativosInteligentesPage from './pages/AplicativosInteligentesPage';
import CalendarioDeAula from './pages/CalendarioDeAula';
import CiclosPage from './pages/CiclosPage';
import CoordenadorPage from './pages/CoordenadorPage';
import CorpoDiscentePage from './pages/CorpoDiscentePage';
import DepoimentosPage from './pages/DepoimentosPage';
import Documentation from './pages/Documentation';
import EmAcaoPage from './pages/EmAcaoPage';
import EspecializacoesPage from './pages/EspecializacoesPage';
import GaleriaMidiasAplicativos from './pages/GaleriaMidiasAplicativos';
import GerenciadorDeMidiaPage from './pages/GerenciadorDeMidiaPage';
import Home from './pages/Home';
import Homepage from './pages/Homepage';
import IncubadoraProfissionalPage from './pages/IncubadoraProfissionalPage';
import MeuPerfilDiscente from './pages/MeuPerfilDiscente';
import MeuPerfilDocente from './pages/MeuPerfilDocente';
import ParceirosPage from './pages/ParceirosPage';
import PerfilDiscente from './pages/PerfilDiscente';
import PerfilDocente from './pages/PerfilDocente';
import PostDetail from './pages/PostDetail';
import PostPage from './pages/PostPage';
import ProfessoresPage from './pages/ProfessoresPage';
import UpgradePage from './pages/UpgradePage';
import UserProfilePage from './pages/UserProfilePage';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminPage": AdminPage,
    "AplicativosInteligentesPage": AplicativosInteligentesPage,
    "CalendarioDeAula": CalendarioDeAula,
    "CiclosPage": CiclosPage,
    "CoordenadorPage": CoordenadorPage,
    "CorpoDiscentePage": CorpoDiscentePage,
    "DepoimentosPage": DepoimentosPage,
    "Documentation": Documentation,
    "EmAcaoPage": EmAcaoPage,
    "EspecializacoesPage": EspecializacoesPage,
    "GaleriaMidiasAplicativos": GaleriaMidiasAplicativos,
    "GerenciadorDeMidiaPage": GerenciadorDeMidiaPage,
    "Home": Home,
    "Homepage": Homepage,
    "IncubadoraProfissionalPage": IncubadoraProfissionalPage,
    "MeuPerfilDiscente": MeuPerfilDiscente,
    "MeuPerfilDocente": MeuPerfilDocente,
    "ParceirosPage": ParceirosPage,
    "PerfilDiscente": PerfilDiscente,
    "PerfilDocente": PerfilDocente,
    "PostDetail": PostDetail,
    "PostPage": PostPage,
    "ProfessoresPage": ProfessoresPage,
    "UpgradePage": UpgradePage,
    "UserProfilePage": UserProfilePage,
}

export const pagesConfig = {
    mainPage: "Homepage",
    Pages: PAGES,
    Layout: __Layout,
};