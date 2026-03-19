import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ReactLenis } from 'lenis/react';
import { useApiQuery } from '../../api/adapter';
import { get } from '../../api/client';
import { FiStar } from 'react-icons/fi';
import MainLoader from '../../components/loaders/mainLoader.jsx'
import Hero from '../../components/homePage/Hero.jsx'
import { Gallery, Reviews } from '../../components/homePage/Showcase.jsx';
import Reveal from '../../components/homePage/Reveal.jsx';

import Growth from '../../components/homePage/Growth.jsx';
import Services from '../../components/homePage/Services.jsx';
import Contact from '../../components/homePage/Contact.jsx';
import Badge from '../../components/ui/Badge.jsx';

const Home = () => {
  const navigate = useNavigate();
  const { data: products, isLoading, error } = useApiQuery("/api/home");

  useEffect(() => { get("/").catch(() => { }) }, []);

  return (
    <ReactLenis root>
    <main className="font-sans bg-gray-100 min-h-screen text-gray-800">
      <Hero />
      <Reveal />

      <section className="mb-24 mt-32 lg:mt-12">
        <h3 className="text-[16px] lg:text-[20px] text-center heading-font text-red-700 font-sans font-[600]">Our Partners</h3>
        <div className="mx-auto mt-2 h-1 w-16 bg-red-700" />
        <div className="md:max-w-4xl mx-auto mt-[15px] lg:mt-16">
          <div className="slider" style={{ '--width': '120px', '--height': '100px', '--quantity': 5 }}>
            <div className="list">
              <div className="stack" style={{ '--position': 1 }}><div className="w-[110px]"><img src="/logos/nike.png" alt="Nike" /></div></div>
              <div className="stack" style={{ '--position': 2 }}><div className="w-[110px]"><img src="/logos/adidas.png" alt="Adidas" /></div></div>
              <div className="stack" style={{ '--position': 3 }}><div className="w-[110px]"><img src="/logos/levi.png" alt="Levi" className="mt-[38px]" /></div></div>
              <div className="stack" style={{ '--position': 4 }}><div className="w-[110px]"><img src="/logos/ck.png" alt="CK" className="mix-blend-overlay scale-[0.75]" /></div></div>
              <div className="stack" style={{ '--position': 5 }}><div className="w-[110px]"><img src="/logos/boss.png" alt="Boss" className="mix-blend-darken mt-[38px]" /></div></div>
            </div>
          </div>
        </div>
      </section>

      <Gallery />

      <Growth />

      <div className="max-w-7xl mx-auto py-32">
        <div className="relative text-3xl font-semibold leading-relaxed">
          <div className="absolute inset-0 w-screen flex flex-wrap text-gray-400 opacity-40 pointer-events-none select-none">
            <div className="slider mt-[-25px] md:mt-[55px] sm:ml-[-150px]" style={{ '--width': '410px', '--height': '150px', '--quantity': 7 }}>
              <div className="list">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div className="stack" style={{ '--position': i }} key={i}><div className="w-[380px] font-[700] text-[55px]">New Arrivals</div></div>
                ))}
              </div>
            </div>
            <div className="slider sm:ml-[-150px] scale-x-[-1]" style={{ '--width': '410px', '--height': '150px', '--quantity': 7 }}>
              <div className="list">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div className="stack" style={{ '--position': i }} key={i}><div className="w-[380px] font-[700] scale-x-[-1] text-[55px]">New Arrivals</div></div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative flex justify-center">
            <section className="flex w-[95%] sm:w-[80%] bg-white/50 shadow-lg backdrop-blur-[3px] rounded-md py-[40px] sm:py-[85px]">
              <div className="w-[35%] flex justify-center">
                <div className="scale-[0.75] xl:mb-0 mb-3 sm:scale-[1.1] md:scale-[1.3] lg:scale-[1.7] ml-8 sm:ml-12 md:ml-20 lg:ml-24 xl:ml-0 lg:mt-[45px]">
                  <MainLoader />
                </div>
              </div>
              <div className="w-[60%] flex flex-col justify-center">
                <p className="text-[22px] sm:text-[32px] md:text-[45px] lg:text-[55px] xl:text-[68px] text-red-700 font-extrabold text-center">FREE DELIVERY</p>
                <p className="text-[14px] sm:text-[20px] md:text-[28px] lg::text-[48px] xl:text-[45px] text-red-400 font-medium text-center">ON <span className="text-red-700">PKR 10,000</span> OR ABOVE</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <section className="py-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Featured <span className="text-red-600">Products</span></h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Handpicked items that represent the best of our collection.</p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: index * 0.1 }} className="bg-white rounded-lg shadow-sm animate-pulse">
                  <div className="aspect-[4/5] bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 mx-4 bg-gray-300 rounded w-2/4 mb-2"></div>
                  <div className="h-4 mx-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="flex mx-2 items-center mb-2 space-x-1"><div className="w-10 h-4 bg-gray-300 rounded ml-2 mb-4" /></div>
                </motion.div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                {(products?.latest || []).map((product, index) => {
                  const discountedPrice = product.sale
                    ? (product.price - (product.price * product.sale) / 100).toFixed(2)
                    : product.price.toFixed(2);
                  return (
                    <motion.div key={product._id || product.id} initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} transition={{ duration: 0.2, delay: index * 0.1 }} whileHover={{ y: -5 }} className="group cursor-pointer">
                      <Link to={`/products/${product._id}`}>
                        <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
                          <div className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                            <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${product.image}`} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            {product.sale > 0 && (
                              <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">Sale</Badge>
                            )}
                          </div>
                          <div className="p-4 sm:p-6">
                            <div className="flex items-center mb-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                                ))}
                              </div>
                              <span className="text-xs sm:text-sm text-gray-500 ml-2">({product.reviews})</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base line-clamp-1">{product.name}</h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-base sm:text-lg font-bold text-gray-900">${discountedPrice}</span>
                              {product.sale > 0 && (
                                <span className="text-xs sm:text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              <div className="w-full flex">
                <button onClick={() => navigate('/productlist/all')} className="mx-auto mt-[55px] shop-now relative overflow-hidden px-8 py-2 border-2 border-white text-white text-lg font-bold rounded-[35px] bg-red-700 shadow-md hover:bg-red-800 hover:text-white hover:shadow-lg active:scale-90 transition-transform duration-300">Shop now</button>
              </div>
            </>
          )}
        </div>
      </section>

      <Services />

      <section>
        <h2 className="text-2xl md:text-4xl font-bold mb-8 text-red-600 text-center">What Our Clients Say</h2>
        <Reviews />
      </section>
      <Contact />
    </main>
    </ReactLenis>
  );
}

export default Home;
