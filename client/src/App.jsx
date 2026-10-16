import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import ByCountry from "./pages/ByCountry.jsx";
import Subscribers from "./pages/Subscribers.jsx";
import Oldest from "./pages/Oldest.jsx";
import TopVideos from "./pages/TopVideos.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/countries" element={<ByCountry />} />
        <Route path="/subscribers" element={<Subscribers />} />
        <Route path="/oldest" element={<Oldest />} />
        <Route path="/videos" element={<TopVideos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
