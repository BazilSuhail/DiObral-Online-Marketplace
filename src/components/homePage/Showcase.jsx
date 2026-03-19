import { useRef, useCallback } from 'react';
import { motion, useInView, useMotionValue, useTransform } from 'motion/react';
import { FiShoppingBag, FiHeart, FiEye } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { BiCheckCircle } from "react-icons/bi";

const fashionItems = [
  {
    title: "Diobral Embodied Suit",
    price: "$199.99",
    rowSpan: "md:row-span-2",
    colSpan: "md:col-span-2",
    image: "https://t3.ftcdn.net/jpg/06/80/95/30/360_F_680953070_LDMCNyNSiP11e2lg4TASbysaNfHkYcAw.jpg"
  },
  {
    title: "Simplicit T-Shirt",
    price: "$129.99",
    rowSpan: "md:row-span-1",
    colSpan: "md:col-span-1",
    image: "https://img.freepik.com/premium-photo/male-models-pose-great-photoshoot-high-fashion-magazine-cover_563241-12441.jpg"
  },
  {
    title: "Regnal Shirts",
    price: "$149.99",
    rowSpan: "md:row-span-1",
    colSpan: "md:col-span-1",
    image: "https://lifestylebyps.com/cdn/shop/articles/10_Hottest_2020_Men_s_Summer_Fashions_1080x.jpg?v=1591958157"
  },
  {
    title: "Comprehensive Guide To The World Of Fashion",
    price: "1000+",
    rowSpan: "md:row-span-2",
    colSpan: "md:col-span-2",
    image: "https://media.istockphoto.com/id/1129542941/photo/sport-man-in-red-hood-with-dark-cement-background.jpg?s=612x612&w=0&k=20&c=BgG9exyim8F5JWqFzRfsaL003s3tlsuwa65f2j7nl_o=",
    isHeader: true
  }
];

const reviews = [
  {
    name: "Jane Doe",
    review: "DiObral Industries has been an incredible partner. Their commitment to quality is evident in every product we receive. Highly recommended!",
    email: "jane.doe@example.com",
    rating: 5,
  },
  {
    name: "John Smith",
    review: "The attention to detail and customer service at DiObral Industries is second to none. I'm always impressed with their professionalism.",
    email: "john.smith@example.com",
    rating: 4,
  },
  {
    name: "Emily Johnson",
    review: "Exceptional quality and excellent service. DiObral Industries exceeds expectations every time!",
    email: "emily.johnson@example.com",
    rating: 3,
  },
  {
    name: "Michael Brown",
    review: "I've been consistently impressed with the products from DiObral Industries. Their attention to detail is unmatched.",
    email: "michael.brown@example.com",
    rating: 4,
  },
  {
    name: "Sarah Wilson",
    review: "DiObral Industries provides top-notch products and excellent customer support. I highly recommend them!",
    email: "sarah.wilson@example.com",
    rating: 5,
  },
  {
    name: "David Lee",
    review: "A fantastic company with exceptional quality. I have always been satisfied with their products and service.",
    email: "david.lee@example.com",
    rating: 5,
  },
  {
    name: "David Lee",
    review: "A fantastic company with exceptional quality. I have always been satisfied with their products and service.",
    email: "david.lee@example.com",
    rating: 5,
  },
   {
    name: "David Lee",
    review: "A fantastic company with exceptional quality. I have always been satisfied with their products and service.",
    email: "david.lee@example.com",
    rating: 5,
  },
   {
    name: "David Lee",
    review: "A fantastic company with exceptional quality. I have always been satisfied with their products and service.",
    email: "david.lee@example.com",
    rating: 5,
  },
];

const TiltCard = ({ item, index }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rotateX = useTransform(y, [0, 1], [6, -6]);
  const rotateY = useTransform(x, [0, 1], [-6, 6]);

  const handleMouse = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    x.set(px);
    y.set(py);
  }, [x, y]);

  const resetTilt = useCallback(() => {
    x.set(0.5);
    y.set(0.5);
  }, [x, y]);

  if (item.isHeader) {
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className={`relative ${item.rowSpan} ${item.colSpan} rounded-2xl overflow-hidden group cursor-pointer`}
        onMouseMove={handleMouse}
        onMouseLeave={resetTilt}
      >
        <motion.div
          className="absolute inset-0"
          style={{ rotateX, rotateY, perspective: 1000 }}
        >
          <img src={item.image} alt="" className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </motion.div>

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative">
            <svg className="absolute -top-12 left-1/2 -translate-x-1/2 w-20 h-20 opacity-30" viewBox="0 0 100 100" fill="none">
              <motion.circle
                cx="50" cy="50" r="45"
                stroke="white" strokeWidth="1.5" strokeDasharray="4 6"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <motion.circle
                cx="50" cy="50" r="30"
                stroke="white" strokeWidth="1" strokeDasharray="2 4"
                initial={{ rotate: 0 }}
                animate={{ rotate: -360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
            </svg>
            <motion.h2
              className="text-2xl md:text-4xl text-white font-bold mb-4 relative"
              initial={{ y: 20, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {item.title}
            </motion.h2>
          </div>
          <motion.p
            className="text-xl text-white/80 font-medium"
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {item.price} Styles
          </motion.p>
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-6 py-2 bg-white/20 backdrop-blur-sm border border-white/40 text-white rounded-full text-sm font-medium hover:bg-white hover:text-red-700 transition-colors"
          >
            Explore Collection
          </motion.button>
        </motion.div>

        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ rotateX, rotateY, perspective: 1000 }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-red-600/10 to-transparent" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative ${item.rowSpan} ${item.colSpan} rounded-2xl overflow-hidden group cursor-pointer`}
      onMouseMove={handleMouse}
      onMouseLeave={resetTilt}
    >
      <motion.div
        className="absolute inset-0"
        style={{ rotateX, rotateY, perspective: 1000 }}
      >
        <img src={item.image} alt="" className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </motion.div>

      <div className="absolute top-4 right-4 flex space-x-2 z-20">
        <motion.button
          initial={{ x: 20, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <FiHeart className="w-4 h-4 text-red-500" />
        </motion.button>
        <motion.button
          initial={{ x: 20, opacity: 0 }}
          animate={isInView ? { x: 0, opacity: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.35 + index * 0.1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <FiEye className="w-4 h-4 text-gray-700" />
        </motion.button>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
          className="flex items-end justify-between"
        >
          <div>
            <h3 className="font-bold text-white text-lg drop-shadow-sm">{item.title}</h3>
            <p className="text-white/80 text-sm mt-0.5">{item.price}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: "#dc2626" }}
            whileTap={{ scale: 0.9 }}
            className="bg-white text-gray-900 p-2.5 rounded-full shadow-lg hover:text-white transition-colors"
          >
            <FiShoppingBag className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-0 border-2 border-transparent rounded-2xl pointer-events-none"
        whileHover={{ borderColor: "rgba(220, 38, 38, 0.4)" }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        className="absolute -top-8 -right-8 w-24 h-24 pointer-events-none"
        initial={{ opacity: 0, scale: 0 }}
        whileHover={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full text-red-400/30">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 8" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

export const Gallery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900">
            Featured <span className="text-red-600">Collection</span>
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">Discover our handpicked selection of premium fashion pieces.</p>
        </motion.div>

        <div className="grid md:min-h-[600px] min-h-[1350px] grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4">
          {fashionItems.map((item, i) => (
            <TiltCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const Reviews = () => (
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="flex items-center space-x-4">
      <section className='md:max-w-6xl mx-auto mt-[15px]'>
        <div className="slider bg-red-5 0 0 " style={{ '--width': '380px', '--height': '220px', '--quantity': 9 }}>
          <div className="list ">
            {reviews.map((review, index) => (
              <div key={index} className="stack" style={{ '--position': index + 1 }}>
                <div className="bg-white p-4 rounded-[18px] shadow-lg">

                  <div className='flex items-center'>
                    <BiCheckCircle className="text-red-300 mr-[15px] text-[45px]" />
                    <div className='flex flex-col'>
                      <p className="font-bold">{review.name}</p>
                      <p className="text-sm text-gray-600">{review.email}</p>
                    </div>
                  </div>

                  <div className="flex mt-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FaStar
                        key={i}
                        size={18}
                        className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>

                  <p className="text-md text-gray-600   my-4">{review.review}</p>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
    <div className="flex items-center scale-x-[-1]">
      <section className='md:max-w-6xl mx-auto mt-[15px]'>
        <div className="slider bg-red- 500 " style={{ '--width': '380px', '--height': '220px', '--quantity': 9 }}>
          <div className="list ">
            {reviews.map((review, index) => (
              <div key={index} className="stack scale-x-[-1]" style={{ '--position': index + 1 }}>
                <div className="bg-white p-4 rounded-[18px] shadow-lg">

                  <div className='flex items-center'>
                    <BiCheckCircle className="text-red-300 mr-[15px] text-[45px]" />
                    <div className='flex flex-col'>
                      <p className="font-bold">{review.name}</p>
                      <p className="text-sm text-gray-600">{review.email}</p>
                    </div>
                  </div>

                  <div className="flex mt-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FaStar
                        key={i}
                        size={18}
                        className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}
                      />
                    ))}
                  </div>

                  <p className="text-md text-gray-600   my-4">{review.review}</p>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  </div>
);

const Showcase = () => (
  <section>
    <Gallery />
    <Reviews />
  </section>
);

export default Showcase;
