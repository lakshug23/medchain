import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ShinyText from "./ShinyText";

const Carousel3D = ({
  items,
  autoRotate = true,
  rotateInterval = 4000,
  cardHeight = 500,
  title = "Role-Based Access Control",
  subtitle = "Dashboard Access",
  tagline = "Explore different dashboard interfaces tailored for specific roles in the MedChain ecosystem.",
  isMobileSwipe = true,
}) => {
  const [active, setActive] = useState(0);
  const carouselRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    if (autoRotate && isInView && !isHovering) {
      const interval = setInterval(() => {
        setActive((prev) => (prev + 1) % items.length);
      }, rotateInterval);
      return () => clearInterval(interval);
    }
  }, [isInView, isHovering, autoRotate, rotateInterval, items.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const onTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      setActive((prev) => (prev + 1) % items.length);
    } else if (distance < -minSwipeDistance) {
      setActive((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  const getCardAnimationClass = (index) => {
    if (index === active) return "scale-100 opacity-100 z-20";
    if (index === (active + 1) % items.length)
      return "translate-x-[40%] scale-95 opacity-60 z-10";
    if (index === (active - 1 + items.length) % items.length)
      return "translate-x-[-40%] scale-95 opacity-60 z-10";
    return "scale-90 opacity-0";
  };

  return (
    <section
      id="carousel3d"
      className="bg-transparent min-w-full mx-auto flex items-center justify-center"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 min-w-[350px] md:min-w-[1000px] max-w-7xl">
        <div
          className="relative overflow-hidden h-[550px]"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          ref={carouselRef}
        >
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`absolute top-0 w-full max-w-md transform transition-all duration-500 ${getCardAnimationClass(
                  index
                )}`}
              >
                <div
                  className={`overflow-hidden h-[${cardHeight}px] shadow-lg 
                  hover:shadow-xl flex flex-col rounded-xl`}
                  style={{
                    backgroundColor: item.color,
                  }}
                >
                  <div
                    className="relative p-6 flex items-center justify-center h-48 overflow-hidden rounded-t-xl"
                    style={{
                      backgroundImage: `url(${item.imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="relative z-10 text-center text-white">
                      <ShinyText
                        size="4xl"
                        weight="bold"
                        baseColor="#ffffff"
                        shineColor="#fbbf24"
                        intensity={0.9}
                        speed={3}
                        direction="left-to-right"
                        className="mb-2"
                      >
                        {item.brand.toUpperCase()}
                      </ShinyText>
                      <div className="w-12 h-1 bg-white mx-auto mb-2" />
                      <p className="text-sm font-semibold">{item.title}</p>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow text-white">
                    <h3 className="text-xl font-bold mb-1 text-white">
                      {item.title}
                    </h3>
                    <p className="text-white/90 text-sm font-medium mb-2">
                      {item.brand}
                    </p>
                    <p className="text-white/90 text-sm flex-grow font-semibold">
                      {item.description}
                    </p>

                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-semibold animate-pulse"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Link
                        to={item.link}
                        className="text-white flex items-center hover:underline relative group font-semibold"
                      >
                        <span className="relative z-10">Access Dashboard</span>
                        <svg
                          className="ml-2 w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-500 hover:bg-white z-30 shadow-md transition-all hover:scale-110"
            onClick={() =>
              setActive((prev) => (prev - 1 + items.length) % items.length)
            }
            aria-label="Previous"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-500 hover:bg-white z-30 shadow-md transition-all hover:scale-110"
            onClick={() => setActive((prev) => (prev + 1) % items.length)}
            aria-label="Next"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-3 z-30">
            {items.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  active === idx
                    ? "bg-gray-500 w-5"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setActive(idx)}
                aria-label={`Go to item ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Carousel3D; 