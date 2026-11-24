import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AreaPage, LearnIndex, TopicPage } from './pages/Learn';
import { Drills } from './pages/Drills';
import { Assess } from './pages/Assess';
import { Plan } from './pages/Plan';
import { Ghosting } from './pages/Ghosting';
import { Log } from './pages/Log';
import { Quiz } from './pages/Quiz';
import { Glossary } from './pages/Glossary';
import { Search } from './pages/Search';
import { NotFound } from './pages/NotFound';

// HashRouter keeps deep links working on any static host (e.g. GitHub Pages) without server rewrites.
export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="learn" element={<LearnIndex />} />
          <Route path="learn/:areaId" element={<AreaPage />} />
          <Route path="learn/:areaId/:topicId" element={<TopicPage />} />
          <Route path="drills" element={<Drills />} />
          <Route path="assess" element={<Assess />} />
          <Route path="plan" element={<Plan />} />
          <Route path="ghosting" element={<Ghosting />} />
          <Route path="log" element={<Log />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="glossary" element={<Glossary />} />
          <Route path="search" element={<Search />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
