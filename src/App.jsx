import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import Home from "./pages/home/Home.jsx";
import About from "./pages/about/About.jsx";
import Products from "./pages/products/Products.jsx";
import ProductDetails from "./pages/productDetails/ProductDetails.jsx";
import Cart from "./pages/cart/Cart.jsx";
import Checkout from "./pages/checkout/Checkout.jsx"; 
import Orders from "./pages/orders/Orders.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Navbar from "./components/navbar/Navbar.jsx";
import Footer from "./components/footer/Footer.jsx";

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