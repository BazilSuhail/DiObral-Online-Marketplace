import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import Home from "./pages/home/Home.jsx";
import About from "./pages/about/About.jsx";
import Products from "./pages/products/Products.jsx";
import ProductDetails from "./pages/products/ProductDetails.jsx";
import Bundles from "./pages/bundles/Bundles.jsx";
import BundleDetails from "./pages/bundles/BundleDetails.jsx";
import Cart from "./pages/cart/Cart.jsx";
import Checkout from "./pages/checkout/Checkout.jsx"; 
import Orders from "./pages/orders/Orders.jsx";
import OrderDetail from "./pages/orders/OrderDetail.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import Profile from "./pages/profile/Profile.jsx";
import Wishlist from "./pages/wishlist/Wishlist.jsx";
import RetailerStores from "./pages/retailer-stores/RetailerStores.jsx";
import StoreDetail from "./pages/retailer-stores/StoreDetail.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";

const authRoutes = ["/signin", "/signup"];
const footerRoutes = ["/", "/about"];

function AppLayout() {
  const { pathname } = useLocation();
  const isAuth = authRoutes.includes(pathname);
  const showFooter = footerRoutes.includes(pathname);

  return (
    <>
      {!isAuth && <Navbar />}
      <div className="pt-21 md:pt-20">
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/productlist/:urlCategory?" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/bundles" element={<Bundles />} />
          <Route path="/bundles/:id" element={<BundleDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders-tracking" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/stores" element={<RetailerStores />} />
          <Route path="/stores/:slug" element={<StoreDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/search" element={<Navigate to="/productlist/all" replace />} />
        </Routes>
      </div>
      {!isAuth && showFooter && <Footer />}
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