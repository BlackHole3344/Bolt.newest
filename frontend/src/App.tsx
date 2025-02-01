import React , { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route  } from 'react-router-dom';
// import LandingPage from './pages/LandingPage';
// import WorkspacePage from './pages/WorkspacePage';


const LandingPage = lazy(() => import('./pages/LandingPage'));
const WorkspacePage = lazy(() => import('./pages/WorkspacePage'));

const LoadingSpinner = () => {
  return (
    <div>Loading...</div>
  );
};
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/workspace" element={<WorkspacePage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;