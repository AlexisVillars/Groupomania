
import HeaderIn from "./components/Header-in";
import HeaderOut from "./components/Header-out";
import Footer from "./components/Footer";
import Register from "./components/Register";
import Login from "./components/Login";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import "../src/app.css";

import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";

function Logout() {
  return (
    <>
      <HeaderOut />
      <main className="layout">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function Connected() {
  return (
    <>
      <HeaderIn />
      <main className="layout">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

const App = () => {

  return (
    <div className="container is-fluid p-0">
      <Router>
        <Routes>
          <Route path="/*" element={<Logout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="*" element={<Navigate to="/Login" replace />} />
          </Route>
          <Route path="/*" element={<Connected />}>
            <Route path="home" element={<Home />} />
            <Route path="profile/:id" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
