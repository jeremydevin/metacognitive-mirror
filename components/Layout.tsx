
import React, { Fragment } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const Header: React.FC = () => {
    const { logout } = useApp();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${
        isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
        }`;

    return (
        <header className="bg-slate-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <span className="text-white font-bold text-xl">Metacognitive Mirror</span>
                        <nav className="hidden md:block ml-10">
                            <div className="flex items-baseline space-x-4">
                                <NavLink to="/" end className={navLinkClasses}>My Decks</NavLink>
                                <NavLink to="/mirror" className={navLinkClasses}>Mirror</NavLink>
                            </div>
                        </nav>
                    </div>
                    <div>
                        <button
                            onClick={handleLogout}
                            className="bg-violet-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
            <nav className="md:hidden bg-slate-800 border-t border-slate-700">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex justify-around">
                    <NavLink to="/" end className={navLinkClasses}>My Decks</NavLink>
                    <NavLink to="/mirror" className={navLinkClasses}>Mirror</NavLink>
                </div>
            </nav>
        </header>
    );
};


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-full bg-slate-900 text-slate-200 flex flex-col">
            <Header />
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
