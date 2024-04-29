import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
    children: ReactNode; // Указываем, что children должен быть типа ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div>
            <header className='container header'>
                <Link to='/' className='logo'>
                    <img src='/logo.png' alt='Logo'/>
                    <p className='logo-text'>My Shop Project</p>
                </Link>
            </header>
            <main>
                {children}
            </main>
            <footer className='footer container'>
                <p>© 2024 My Shop by IceDaria</p>
            </footer>
        </div>
    );
};

export default Layout;