import { FiShoppingBag, FiHeart, FiEye } from 'react-icons/fi';

const Section2 = () => {
  const fashionItems = [
    {
      title: "Diobral Embodied Suit",
      price: "$199.99",
      rowSpan: "md:row-span-2",
      colSpan: "md:col-span-2",
      bgColor: "bg-gray-400",
      image: "https://t3.ftcdn.net/jpg/06/80/95/30/360_F_680953070_LDMCNyNSiP11e2lg4TASbysaNfHkYcAw.jpg"
    },
    {
      title: "Simplicit T-Shirt",
      price: "$129.99",
      rowSpan: "md:row-span-1",
      colSpan: "md:col-span-1",
      bgColor: "bg-gray-200",
      image: "https://img.freepik.com/premium-photo/male-models-pose-great-photoshoot-high-fashion-magazine-cover_563241-12441.jpg"
    },
    {
      title: "Regnal Shirts",
      price: "$149.99",
      rowSpan: "md:row-span-1",
      colSpan: "md:col-span-1",
      bgColor: "bg-gray-300",
      image: "https://lifestylebyps.com/cdn/shop/articles/10_Hottest_2020_Men_s_Summer_Fashions_1080x.jpg?v=1591958157"
    },
    {
      title: "Comprehensive Guide To The World Of Fashion",
      price: "1000+",
      rowSpan: "md:row-span-2",
      colSpan: "md:col-span-2",
      bgColor: "text-white",
      image: "https://media.istockphoto.com/id/1129542941/photo/sport-man-in-red-hood-with-dark-cement-background.jpg?s=612x612&w=0&k=20&c=BgG9exyim8F5JWqFzRfsaL003s3tlsuwa65f2j7nl_o=",
      isHeader: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:min-h-[600px] min-h-[1350px] grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-x-4 gap-y-2">
        {fashionItems.map((item, index) => (
          <div
            key={index}
            className={`relative ${item.rowSpan} ${item.colSpan} rounded-lg overflow-hidden flex items-center h-full justify-center p-6`}
            style={{
              backgroundImage: `url(${item.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!item.isHeader && (
              <>
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button className="bg-white p-2 rounded-full hover:bg-gray-100 transition">
                    <FiHeart className="text-gray-700" />
                  </button>
                  <button className="bg-white p-2 rounded-full hover:bg-gray-100 transition">
                    <FiEye className="text-gray-700" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="font-semibold text-white text-lg">{item.title}</h3>
                  <p className="text-gray-700">{item.price}</p>
                </div>
                <button className="absolute bottom-4 right-4 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition">
                  <FiShoppingBag />
                </button>
              </>
            )}

            {item.isHeader && (
              <div className="text-center mt-2 p-4">
                <h2 className="text-2xl md:text-4xl text-white font-bold mb-4">{item.title}</h2>
                <p className="text-xl text-white">{item.price}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


export default Section2;