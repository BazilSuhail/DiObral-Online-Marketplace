import { FaStar } from 'react-icons/fa'; 
import { BiCheckCircle } from "react-icons/bi";

const Section3 = () => {
  const reviews = [
    {
      name: "Jane Doe",
      review: "DiObral Industries has been an incredible partner. Their commitment to quality is evident in every product we receive. Highly recommended!",
      email: "jane.doe@example.com",
      rating: 5,
    },
    {
      name: "John Smith",
      review: "The attention to detail and customer service at DiObral Industries is second to none. I’m always impressed with their professionalism.",
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

  return (
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
                      {/* <p className='mr-[12px] text-gray-700 text-sm font-[600] underline'>Rating:</p> */}
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
                      {/* <p className='mr-[12px] text-gray-700 text-sm font-[600] underline'>Rating:</p> */}
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
};


export default Section3 ;