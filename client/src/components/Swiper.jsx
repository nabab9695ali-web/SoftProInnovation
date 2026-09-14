import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Swiper as SwiperReact, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { API_BASE_URL } from '../config/api';
import { formatImg } from '../utils/imageUrl';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

import img1 from '../assets/1.avif';
import img2 from '../assets/2.png';
import img3 from '../assets/3.png';
import img4 from '../assets/4.png';
import img5 from '../assets/5.png';
import img6 from '../assets/6.png';
import img7 from '../assets/7.png';
import img8 from '../assets/8.png';
import img9 from '../assets/9.png';
import img10 from '../assets/10.png';

const fallbackImages = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

const fallbackCategories = [
  { _id: 'c1', category: 'Microcontrollers', image: img1 },
  { _id: 'c2', category: 'Sensors & Modules', image: img2 },
  { _id: 'c3', category: 'Displays & LCDs', image: img3 },
  { _id: 'c4', category: 'Motors & Drivers', image: img4 },
  { _id: 'c5', category: 'Power Supplies', image: img5 },
  { _id: 'c6', category: 'Wireless & IoT', image: img6 },
  { _id: 'c7', category: 'Robotics Kits', image: img7 },
  { _id: 'c8', category: 'Cables & Headers', image: img8 },
  { _id: 'c9', category: 'Development Boards', image: img9 },
  { _id: 'c10', category: 'Accessories', image: img10 },
];

const CATEGORY_THEMES = [
  {
    className: 'cat-theme-ocean',
    tag: 'Trending',
    icon: 'bi-cpu-fill',
  },
  {
    className: 'cat-theme-sunset',
    tag: 'Hot Deal',
    icon: 'bi-fire',
  },
  {
    className: 'cat-theme-emerald',
    tag: 'Verified',
    icon: 'bi-patch-check-fill',
  },
  {
    className: 'cat-theme-purple',
    tag: 'Top Pick',
    icon: 'bi-lightning-charge-fill',
  },
  {
    className: 'cat-theme-rose',
    tag: 'Special',
    icon: 'bi-heart-fill',
  },
  {
    className: 'cat-theme-indigo',
    tag: 'Featured',
    icon: 'bi-stars',
  },
];

const Swiper = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('slider'); // 'slider' | 'grid'

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/category/show`);
        if (!isMounted) return;
        if (Array.isArray(res.data) && res.data.length > 0) {
          const activeCategories = res.data.filter(
            (cat) => !cat.status || cat.status.toLowerCase() === 'active'
          );
          setCategories(activeCategories.length > 0 ? activeCategories : fallbackCategories);
        } else {
          setCategories(fallbackCategories);
        }
      } catch {
        if (isMounted) setCategories(fallbackCategories);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const getCategoryImageUrl = (cat, index) => {
    if (cat?.image && typeof cat.image === 'string' && cat.image.trim() !== '') {
      return formatImg(cat.image, fallbackImages[index % fallbackImages.length]);
    }
    return fallbackImages[index % fallbackImages.length];
  };

  const handleCategoryClick = (catName) => {
    if (catName) {
      navigate(`/product?category=${encodeURIComponent(catName)}`);
    }
  };

  const hasMultiple = categories.length > 5;

  const renderCategoryTile = (cat, index) => {
    const catName = cat.category || cat.name || 'Category';
    const catImg = getCategoryImageUrl(cat, index);
    const productCount = cat.productCount !== undefined ? cat.productCount : 0;
    const theme = CATEGORY_THEMES[index % CATEGORY_THEMES.length];

    return (
      <div
        className={`flipkart-category-tile ${theme.className} shadow-xs`}
        onClick={() => handleCategoryClick(catName)}
        title={`Explore ${catName}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCategoryClick(catName);
          }
        }}
      >
        {/* Themed Top Gradient Accent Bar */}
        <div className="cat-top-bar"></div>

        {/* Themed Micro Tag */}
        <div className="cat-chip-tag">
          <i className={`bi ${theme.icon}`}></i>
          <span>{theme.tag}</span>
        </div>

        {/* Themed Avatar Frame */}
        <div className="flipkart-cat-circle shadow-xs">
          <img
            src={catImg}
            alt={catName}
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImages[index % fallbackImages.length];
            }}
          />
        </div>

        {/* Text & Count */}
        <div className="w-100 mt-auto">
          <div className="flipkart-cat-name" title={catName}>
            {catName}
          </div>

          <div className="d-flex align-items-center justify-content-center mt-2">
            <span className="flipkart-cat-badge">
              <span>{productCount > 0 ? `${productCount}+ Items` : `Explore`}</span>
              <i className="bi bi-chevron-right ms-0.5" style={{ fontSize: '10px' }}></i>
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="category-swiper-section py-5 bg-white border-bottom border-top">
      <div className="container">
        {/* Header with Title, Stats and Controls */}
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="section-eyebrow mb-0">DISCOVER OUR CATALOG</span>
              <span className="badge bg-light text-dark border px-2 py-0.5 small rounded-pill fw-semibold">
                {categories.length} Categories
              </span>
            </div>
            <h2 className="section-heading mb-0">
              Popular <span className="highlight-italic">Categories</span>
            </h2>
            <div className="section-accent-line mt-2"></div>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* View Mode Toggle */}
            <div className="btn-group p-1 bg-light rounded-3 border">
              <button
                type="button"
                className={`cat-view-btn border-0 py-1.5 px-3 rounded-2 ${viewMode === 'slider' ? 'active' : ''}`}
                onClick={() => setViewMode('slider')}
                title="Carousel Slider View"
              >
                <i className="bi bi-sliders2"></i>
                <span className="d-none d-sm-inline">Slider</span>
              </button>
              <button
                type="button"
                className={`cat-view-btn border-0 py-1.5 px-3 rounded-2 ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Multi-Row Grid View"
              >
                <i className="bi bi-grid-3x3-gap-fill"></i>
                <span className="d-none d-sm-inline">All Grid</span>
              </button>
            </div>

            {/* Slider Arrows (Only active in slider mode) */}
            {viewMode === 'slider' && hasMultiple && (
              <div className="d-flex align-items-center gap-1.5 ms-1">
                <button
                  type="button"
                  className="cat-nav-btn swiper-cat-prev rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px', padding: 0 }}
                  aria-label="Previous Slide"
                >
                  <i className="bi bi-chevron-left fs-6"></i>
                </button>
                <button
                  type="button"
                  className="cat-nav-btn swiper-cat-next rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px', padding: 0 }}
                  aria-label="Next Slide"
                >
                  <i className="bi bi-chevron-right fs-6"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <div className="spinner-border text-primary me-2" role="status"></div>
            <span className="text-muted fw-medium">Loading categories from admin dashboard...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-5 bg-light rounded-4 border">
            <i className="bi bi-folder2-open fs-1 text-muted d-block mb-2"></i>
            <h6 className="text-muted mb-1">No Categories Added Yet</h6>
            <p className="small text-secondary mb-0">
              Categories added in the admin dashboard will automatically appear here.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Multi-Row Grid View with distinct alternating colors top, bottom, and side-by-side */
          <div className="row g-3 row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 py-2">
            {categories.map((cat, index) => (
              <div className="col" key={cat._id || cat.id || index}>
                {renderCategoryTile(cat, index)}
              </div>
            ))}
          </div>
        ) : (
          /* Swiper Carousel Slider */
          <SwiperReact
            key={`swiper-cat-count-${categories.length}`}
            modules={[Navigation, Autoplay]}
            spaceBetween={18}
            slidesPerView={1}
            loop={hasMultiple}
            speed={800}
            autoplay={
              categories.length > 3
                ? {
                    delay: 3500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            navigation={{
              prevEl: '.swiper-cat-prev',
              nextEl: '.swiper-cat-next',
            }}
            breakpoints={{
              480: {
                slidesPerView: Math.min(2, categories.length),
                spaceBetween: 16,
              },
              768: {
                slidesPerView: Math.min(3, categories.length),
                spaceBetween: 18,
              },
              1024: {
                slidesPerView: Math.min(5, categories.length),
                spaceBetween: 20,
              },
            }}
            className="category-swiper py-2"
          >
            {categories.map((cat, index) => (
              <SwiperSlide key={cat._id || cat.id || index}>
                {renderCategoryTile(cat, index)}
              </SwiperSlide>
            ))}
          </SwiperReact>
        )}
      </div>
    </section>
  );
};

export default Swiper;
