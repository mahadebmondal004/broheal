import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, X, User, ChevronDown, LogOut, Settings, LayoutDashboard, UserCog } from "lucide-react";
import logoUrl from "../../assets/broheal.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeId, setActiveId] = useState("home");
  const [scrollDir, setScrollDir] = useState("down");
  const lastScrollY = useRef(0);
  const dropdownRef = useRef(null);



  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      const dir = y < lastScrollY.current ? "up" : "down";
      if (dir !== scrollDir) setScrollDir(dir);
      lastScrollY.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollDir]);

  useEffect(() => {
    const path = location.pathname;
    const map = {
      "/": "home",
      "/about": "about",
      "/services": "services",
      "/how-it-works": "how-it-works",

      "/gallery": "gallery",
      "/contact": "contact",
    };
    setActiveId(map[path] || "home");
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scrollToSection = (sectionId) => {
    setActiveId(sectionId);
    const routeMap = {
      home: "/",
      about: "/about",
      services: "/services",
      "how-it-works": "/how-it-works",
      gallery: "/gallery",
      contact: "/contact",
    };

    navigate(routeMap[sectionId] || "/");
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      setProfileDropdownOpen(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigation = [
    { name: "Home", id: "home" },
    { name: "About", id: "about" },
    { name: "Services", id: "services" },
    { name: "How It Works", id: "how-it-works" },

    { name: "Gallery", id: "gallery" },
    { name: "Contact", id: "contact" },
  ];

  const handleBookNow = () => {
    if (user && user.role === "user") {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  const headerBg = isTransparent
    ? "bg-transparent"
    : scrolled
      ? scrollDir === "up"
        ? "bg-white backdrop-blur-lg shadow-lg border-b border-gray-200"
        : "bg-white/95 backdrop-blur-lg shadow-md border-b border-gray-100"
      : "bg-white border-b border-gray-100";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <img
            src={logoUrl}
            alt="Bro Heal"
            className={`h-10 lg:h-12 transition-all duration-300 hover:scale-105 cursor-pointer ${isTransparent ? 'brightness-0 invert' : ''}`}
            onClick={() => navigate("/")}
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  className="relative group"
                >
                  <span
                    className={`text-lg font-medium transition-colors duration-200 ${isActive
                      ? isTransparent
                        ? "text-white"
                        : "text-blue-600"
                      : isTransparent
                        ? "text-white/90 hover:text-white"
                        : "text-gray-700 group-hover:text-blue-600"
                      }`}
                  >
                    {item.name}
                  </span>
                  <span
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-300 ${isTransparent ? "bg-white" : "bg-blue-500"
                      } ${isActive ? "w-2/3" : "w-0 group-hover:w-2/3"}`}
                  ></span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <div className="relative flex items-center gap-3" ref={dropdownRef}>
                <button
                  onClick={handleBookNow}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg ${isTransparent
                    ? "bg-white/90 text-blue-600 hover:bg-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  Book Now
                </button>

                {/* Profile Button */}
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 border transition-all duration-200 ${isTransparent
                    ? "bg-white/90 border-white/40 hover:border-white/60 hover:shadow-md"
                    : "bg-white border-gray-200 hover:border-blue-400 hover:shadow-md"
                    }`}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-blue-700" />
                    )}
                  </div>

                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-600 capitalize">
                      {user.role || "user"}
                    </p>
                  </div>

                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${profileDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600 mt-1">+91 {user.phone}</p>
                    </div>

                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 text-gray-700"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>

                    <button
                      onClick={() => {
                        navigate("/profile");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 text-gray-700"
                    >
                      <UserCog className="w-4 h-4" />
                      Edit Profile
                    </button>

                    <button
                      onClick={() => {
                        navigate("/settings");
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 text-gray-700"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition flex items-center gap-3"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={handleBookNow}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${isTransparent
                    ? "border border-white text-white hover:bg-white/10"
                    : "border border-blue-600 text-blue-600 hover:bg-blue-50"
                    }`}
                >
                  Book Now
                </button>

                <button
                  onClick={() => navigate("/user/login")}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all shadow-md bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] text-white hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47]`}
                >
                  Login
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-xl">
          <div className="px-6 py-6">
            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-3 mb-6">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left py-3 px-4 rounded-lg font-medium transition ${activeId === item.id
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* Mobile Login / Profile */}
            {user ? (
              <>
                <div className="px-4 py-3 border-b border-gray-100 mb-4">
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600 mt-1">+91 {user.phone}</p>
                </div>

                <button
                  onClick={() => {
                    handleBookNow();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-[#0A3D47] via-[#0A3D47] to-[#0A3D47] text-white rounded-lg font-semibold mb-3 hover:from-[#08343D] hover:via-[#08343D] hover:to-[#0A3D47] transition"
                >
                  Book Now
                </button>

                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-gray-700 border border-gray-200 rounded-lg mb-3 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center justify-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </span>
                </button>

                <button
                  onClick={() => {
                    navigate("/profile");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-gray-700 border border-gray-200 rounded-lg mb-3 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center justify-center gap-2">
                    <UserCog className="w-4 h-4" />
                    Edit Profile
                  </span>
                </button>

                <button
                  onClick={() => {
                    navigate("/settings");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-gray-700 border border-gray-200 rounded-lg mb-3 hover:bg-gray-50 transition"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </span>
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    handleBookNow();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold mb-3 hover:bg-blue-700 transition"
                >
                  Book Now
                </button>
                <button
                  onClick={() => {
                    navigate("/user/login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-white text-[#0A3D47] border border-[#0A3D47] rounded-lg font-semibold hover:bg-gradient-to-r hover:from-[#0A3D47] hover:via-[#0A3D47] hover:to-[#0A3D47] hover:text-white transition"
                >
                  Login Now
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
export default Navbar;
