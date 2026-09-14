import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo.png';
import { useCart } from '../context/CartContext';
import { formatImg } from '../utils/imageUrl';
import { API_BASE_URL } from '../config/api';

const Header = () => {
  const navigate = useNavigate();
  const { getWishlistCount, getCartCount } = useCart();
  const [userName, setUserName] = useState('');
  const [userPicture, setUserPicture] = useState('');
  const [userRole, setUserRole] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allCatalog, setAllCatalog] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    // Fetch catalog once for instant header search suggestions
    const loadCatalog = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/product/show`);
        if (Array.isArray(res.data)) {
          setAllCatalog(res.data);
        }
      } catch (err) {
        console.error('Failed to load search catalog:', err);
      }
    };
    loadCatalog();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 1) {
      const q = val.toLowerCase().trim();
      const matches = allCatalog.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.category_id?.category && p.category_id.category.toLowerCase().includes(q))
      ).slice(0, 5);
      setSearchSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/Product?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/Product');
    }
  };

  const handleSelectSuggestion = (pId) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${pId}`);
  };

  useEffect(() => {
    const syncUserSession = () => {
      const token = localStorage.getItem('token');
      const name = localStorage.getItem('name');
      const role = localStorage.getItem('role');
      const picture = localStorage.getItem('picture');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (token && name) {
        setUserName(name);
        setUserRole(role);
        setUserPicture(user.picture || picture || '');
      } else {
        setUserName('');
        setUserRole('');
        setUserPicture('');
      }
    };

    syncUserSession();

    window.addEventListener('userSessionChange', syncUserSession);
    window.addEventListener('storage', syncUserSession);

    return () => {
      window.removeEventListener('userSessionChange', syncUserSession);
      window.removeEventListener('storage', syncUserSession);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('picture');
    localStorage.removeItem('adminId');
    localStorage.removeItem('softpro_cart');
    localStorage.removeItem('softpro_wishlist');
    setUserName('');
    setUserPicture('');
    setUserRole('');
    setShowDropdown(false);

    // Notify app of user session change (resets cart & wishlist)
    window.dispatchEvent(new Event('userSessionChange'));

    navigate('/login');
  };

  const isUserLoggedIn = Boolean(userName && localStorage.getItem('token'));
  const wishlistCount = isUserLoggedIn && getWishlistCount ? getWishlistCount() : 0;
  const cartCount = isUserLoggedIn && getCartCount ? getCartCount() : 0;

  return (
    <div className="container-fluid p-0 sticky-top storefront-header" style={{ zIndex: 1040 }}>
      <nav className="navbar navbar-expand-lg navbar-dark storefront-navbar py-2 px-3 px-lg-4">
        <div className="container-fluid">
          <Link className="navbar-brand storefront-brand d-flex align-items-center text-white my-0 me-lg-3" to="/">
            <span className="storefront-brand-mark">
              <img src={logo} alt="Softpro Innovation Logo" width="30" height="30" />
            </span>
            <span className="storefront-brand-copy"><strong>Softpro</strong><em>Innovation</em></span>
          </Link>

          {/* Flipkart Style Universal Search Bar */}
          <div className="storefront-search-wrap d-none d-md-block mx-lg-3 flex-grow-1 position-relative" ref={searchRef} style={{ maxWidth: '440px' }}>
            <form onSubmit={handleSearchSubmit} className="d-flex align-items-center position-relative w-100">
              <input
                type="text"
                className="form-control storefront-search-input"
                placeholder="Search electronics, Raspberry Pi, Arduino, sensors..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => {
                  if (searchSuggestions.length > 0) setShowSuggestions(true);
                }}
              />
              <button
                type="submit"
                className="btn storefront-search-submit"
                title="Search"
                aria-label="Search"
              >
                <i className="bi bi-search"></i>
              </button>
            </form>

            {/* Live Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="storefront-search-dropdown shadow-lg">
                <div className="p-2 border-bottom text-muted small d-flex justify-content-between align-items-center">
                  <span>Search Suggestions</span>
                  <span className="badge bg-light text-dark border">Press Enter to view all</span>
                </div>
                <div className="storefront-search-list">
                  {searchSuggestions.map((item) => {
                    const pId = item._id || item.id;
                    const pImg = formatImg(item.thumbnail);
                    return (
                      <div
                        key={pId}
                        className="storefront-search-item d-flex align-items-center gap-2 p-2 cursor-pointer"
                        onClick={() => handleSelectSuggestion(pId)}
                      >
                        <img
                          src={pImg}
                          alt={item.name}
                          width="36"
                          height="36"
                          className="rounded object-fit-cover flex-shrink-0 border bg-light"
                        />
                        <div className="flex-grow-1 overflow-hidden text-start">
                          <div className="fw-semibold text-dark text-truncate small">{item.name}</div>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold text-primary small">₹{Number(item.price).toLocaleString('en-IN')}</span>
                            {item.category && (
                              <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '10px' }}>
                                {item.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <i className="bi bi-arrow-right-short text-muted fs-5"></i>
                      </div>
                    );
                  })}
                </div>
                <div
                  className="p-2 text-center bg-light border-top cursor-pointer text-primary fw-bold small"
                  onClick={handleSearchSubmit}
                >
                  View all results for "{searchQuery}" <i className="bi bi-arrow-right"></i>
                </div>
              </div>
            )}
          </div>

          <button className="navbar-toggler storefront-toggler py-1 px-2 ms-auto" type="button" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" data-bs-toggle="collapse">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            {/* Mobile Search Bar */}
            <div className="d-block d-md-none my-2 w-100">
              <form onSubmit={handleSearchSubmit} className="d-flex align-items-center position-relative w-100">
                <input
                  type="text"
                  className="form-control storefront-search-input"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <button type="submit" className="btn storefront-search-submit">
                  <i className="bi bi-search"></i>
                </button>
              </form>
            </div>

            <ul className="navbar-nav storefront-nav ms-auto mb-0 gap-1 gap-lg-2 fw-medium">
              <li className="nav-item">
                <NavLink className="nav-link px-3 py-1.5" to="/">Home</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link px-3 py-1.5" to="/about">About</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link px-3 py-1.5" to="/Product">Products</NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link px-3 py-1.5" to="/Contact">Contact Us</NavLink>
              </li>
            </ul>
            <div className="storefront-actions d-flex gap-2 align-items-center mt-3 mt-lg-0">
              {/* Wishlist Button */}
              <Link
                to={isUserLoggedIn ? "/wishlist" : "/login"}
                className="btn btn-outline-light btn-sm position-relative d-flex align-items-center justify-content-center p-2 rounded-circle border-0"
                title={isUserLoggedIn ? "Wishlist" : "Login to view Wishlist"}
                style={{ width: '36px', height: '36px' }}
              >
                <i className="bi bi-heart fs-6"></i>
                {isUserLoggedIn && wishlistCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Cart Button */}
              <Link
                to={isUserLoggedIn ? "/cart" : "/login"}
                className="btn btn-outline-light btn-sm position-relative d-flex align-items-center justify-content-center p-2 rounded-circle border-0"
                title={isUserLoggedIn ? "Shopping Cart" : "Login to view Cart"}
                style={{ width: '36px', height: '36px' }}
              >
                <i className="bi bi-cart3 fs-6"></i>
                {isUserLoggedIn && cartCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                    {cartCount}
                  </span>
                )}
              </Link>

              {userName ? (
                <div className="position-relative" ref={dropdownRef}>
                  <button
                    className="navbar-btn-user dropdown-toggle"
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {userPicture ? (
                      <img src={formatImg(userPicture)} alt="Profile" className="rounded-circle me-1" width="24" height="24" style={{ objectFit: 'cover' }} />
                    ) : (
                      <i className="bi bi-person-circle fs-6"></i>
                    )} {userName}
                  </button>
                  {showDropdown && (
                    <div className="user-dropdown-menu">
                      <div className="user-dropdown-header">
                        Your Account
                      </div>
                      <div className="user-dropdown-list">
                        {userRole === 'admin' && (
                          <Link className="user-dropdown-item text-primary fw-semibold" to="/dashboard" onClick={() => setShowDropdown(false)}>
                            <i className="bi bi-speedometer2 text-primary"></i>
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <Link className="user-dropdown-item" to="/profile" onClick={() => setShowDropdown(false)}>
                          <i className="bi bi-person-circle"></i>
                          <span>My Profile</span>
                        </Link>
                        <Link className="user-dropdown-item" to="/profile?tab=orders" onClick={() => setShowDropdown(false)}>
                          <i className="bi bi-box-seam"></i>
                          <span>Orders</span>
                        </Link>
                        <Link className="user-dropdown-item" to="/track-order" onClick={() => setShowDropdown(false)}>
                          <i className="bi bi-truck text-success"></i>
                          <span>Track Order</span>
                        </Link>
                        <Link className="user-dropdown-item" to="/returns" onClick={() => setShowDropdown(false)}>
                          <i className="bi bi-arrow-return-left text-danger"></i>
                          <span>Return Policy</span>
                        </Link>
                        <Link className="user-dropdown-item" to="/profile?tab=addresses" onClick={() => setShowDropdown(false)}>
                          <i className="bi bi-geo-alt"></i>
                          <span>Saved Addresses</span>
                        </Link>
                        <Link className="user-dropdown-item" to="/wishlist" onClick={() => setShowDropdown(false)}>
                          <i className="bi bi-heart"></i>
                          <span>Wishlist</span>
                        </Link>
                        <div className="user-dropdown-divider"></div>
                        <button
                          className="user-dropdown-item logout-item"
                          onClick={handleLogout}
                        >
                          <i className="bi bi-box-arrow-right"></i>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="d-flex gap-2 ms-1">
                  <Link to="/login" className="navbar-btn-login">Login</Link>
                  <Link to="/register" className="navbar-btn-register">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;