import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import Home from "./Pages/Home.jsx";
import About from "./Pages/About.jsx";
import Products from "./Pages/Products.jsx";
import ProductDetails from "./Pages/ProductDetails.jsx";
import Cart from "./Pages/Cart.jsx";
import Checkout from "./Pages/Checkout.jsx"; 
import Orders from "./Pages/Orders.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import Profile from "./Pages/Profile.jsx";
import Navbar from "./Components/Navbar.jsx";
import Footer from "./Components/Footer.jsx";

const authRoutes = ["/signin", "/signup"];

function AppLayout() {
  const { pathname } = useLocation();
  const isAuth = authRoutes.includes(pathname);

  return (
    <>
      {!isAuth && <Navbar />}
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/productlist/:urlCategory?" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders-tracking" element={<Orders />} />
        <Route path="/signin" element={<LoginPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<Navigate to="/productlist/All" replace />} />
      </Routes>
      {!isAuth && <Footer />}
    </>
  );
}

const App = () => {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
};

export default App;