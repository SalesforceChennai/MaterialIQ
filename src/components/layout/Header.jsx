import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  Layers,
  Boxes,
  Package,
  Truck,
  Users
} from 'lucide-react';
import { api } from '../../services/api';

export default function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await api.globalSearch(searchQuery);
      setSearchResults(results);
      setShowSearchDropdown(true);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectSearchResult = (result) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    // Navigate to Trace page with that entity ID
    navigate(`/trace?id=${result.id}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/trace?id=${searchQuery.trim().toUpperCase()}`);
    }
  };

  const getEntityIcon = (category) => {
    switch (category) {
      case 'raw_material':
        return <Boxes className="h-4 w-4 text-emerald-600" />;
      case 'batch':
        return <Layers className="h-4 w-4 text-blue-600" />;
      case 'product':
        return <Package className="h-4 w-4 text-orange-600" />;
      case 'shipment':
        return <Truck className="h-4 w-4 text-purple-600" />;
      case 'customer':
        return <Users className="h-4 w-4 text-rose-600" />;
      default:
        return <Search className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-8 backdrop-blur-md">
      {/* Search Input Bar */}
      <div className="relative w-full max-w-xl" ref={searchRef}>
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
            placeholder="Search material, batch, product, shipment or customer..."
            className="w-full rounded-xl border border-slate-200/90 bg-slate-50/70 py-2 pl-10 pr-24 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <span className="hidden sm:inline-flex rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-2xs">
              Ctrl K
            </span>
            <button
              type="submit"
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 transition-all"
              title="Search"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>

        {/* Global Search Results Dropdown */}
        {showSearchDropdown && (
          <div className="absolute left-0 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
            <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Search Results ({searchResults.length})
              </span>
              <span className="text-[11px] text-slate-400">Click to trace journey</span>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No matching entities found for "{searchQuery}".
                </div>
              ) : (
                searchResults.map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(item)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                        {getEntityIcon(item.category)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{item.id}</span>
                          <span className="text-xs text-slate-600 font-medium">{item.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">{item.subtitle}</p>
                      </div>
                    </div>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {item.type}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl z-50">
              <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
              </div>
              <div className="p-6 text-center text-xs text-slate-400">
                No new notifications
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-1.5 pr-3 shadow-2xs transition-all hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 font-bold text-white text-xs shadow-xs">
              RS
            </div>
            <div className="text-left hidden md:block">
              <h5 className="text-xs font-bold text-slate-800 leading-tight">Rahul S</h5>
              <p className="text-[10px] font-medium text-slate-400 leading-tight">Administrator</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl z-50 text-xs">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <p className="font-bold text-slate-800">Rahul S</p>
                <p className="text-[11px] text-slate-500">rahul@materialiq.io</p>
              </div>
              <div className="p-1 space-y-0.5">
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                >
                  Account Settings
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                >
                  Audit Logs
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                >
                  API Keys &amp; Webhooks
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
