import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom"
import Home from "./pages/home/Home.jsx";
const About = lazy(() => import("./pages/about/About.jsx"));
const Products = lazy(() => import("./pages/products/Products.jsx"));
const ProductDetails = lazy(() => import("./pages/products/ProductDetails.jsx"));
const Bundles = lazy(() => import("./pages/bundles/Bundles.jsx"));
const BundleDetails = lazy(() => import("./pages/bundles/BundleDetails.jsx"));
const Cart = lazy(() => import("./pages/cart/Cart.jsx"));
const Checkout = lazy(() => import("./pages/checkout/Checkout.jsx"));
const Orders = lazy(() => import("./pages/orders/Orders.jsx"));
const OrderDetail = lazy(() => import("./pages/orders/OrderDetail.jsx"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage.jsx"));
const Profile = lazy(() => import("./pages/profile/Profile.jsx"));
const Wishlist = lazy(() => import("./pages/wishlist/Wishlist.jsx"));
const RetailerStores = lazy(() => import("./pages/retailer-stores/RetailerStores.jsx"));
const StoreDetail = lazy(() => import("./pages/retailer-stores/StoreDetail.jsx"));
import Navbar from "./components/layout/Navbar.jsx";
import Footer from "./components/layout/Footer.jsx";
import AssistantDock from "./components/assistant/AssistantDock.jsx";
import MainLoader from "./components/loaders/mainLoader.jsx";
import { getPageMeta } from "./lib/routeMeta.js";

const authRoutes = ["/signin", "/signup"];
const footerRoutes = ["/", "/about"];

function AppLayout() {
  const { pathname } = useLocation();
  const { title } = getPageMeta(pathname);

  useEffect(() => {
    document.title = title;
  }, [title]);

  const isAuth = authRoutes.includes(pathname);
  const showFooter = footerRoutes.includes(pathname);


  return (
    <>
      {!isAuth && <Navbar />}
      <div className="pt-21 md:pt-20">
        <Suspense fallback={<MainLoader />}>
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
        </Suspense>
      </div>
      {!isAuth && showFooter && <Footer />}
      <AssistantDock />
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
