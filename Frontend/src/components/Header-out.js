import React from 'react';
import { NavLink } from "react-router-dom";

const Header = () => {
    return (
        <>
            <header>
                <h1 className=""><img className='is-centered' src="/assets/icon-left-font-monochrome-black.svg" width="200" alt="Groupomania" /></h1>
                <div className="tabs is-centered">
                    <ul>
                        <li>
                            <NavLink to="Register" className={({ isActive }) => (isActive ? 'nav-active' : 'inactive')}>
                                <span>S'inscrire</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="Login" className={({ isActive }) => (isActive ? 'nav-active' : 'inactive')}>
                                <span>Se connecter</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </header>
        </>
    );
};

export default Header;