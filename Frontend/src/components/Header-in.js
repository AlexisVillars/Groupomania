import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { NavLink, useNavigate } from 'react-router-dom';

const Header = () => {
    const [myId, setId] = useState('');
    const [isAdmin, setAdmin] = useState('');
    const [token, setToken] = useState('');
    const [expire, setExpire] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        refreshToken();
    }, []);

    const refreshToken = async () => {
        try {
            const response = await axios.get('http://localhost:5000/users/token');
            setToken(response.data.accessToken);
            const decoded = jwt_decode(response.data.accessToken);
            setId(decoded.userId);
            setAdmin(decoded.isAdmin);
            setExpire(decoded.exp);
        } catch (error) {
            if (error.response) {
                navigate("/", { replace: true });
            }
        }
    }

    const axiosJWT = axios.create();

    axiosJWT.interceptors.request.use(async (config) => {
        const currentDate = new Date();
        if (expire * 1000 < currentDate.getTime()) {
            const response = await axios.get('http://localhost:5000/users/token');
            config.headers.Authorization = `Bearer ${response.data.accessToken}`;
            setToken(response.data.accessToken);
            const decoded = jwt_decode(response.data.accessToken);
            setAdmin(decoded.isAdmin);
            setExpire(decoded.exp);
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    const Logout = async () => {
        try {
            await axios.delete('http://localhost:5000/users/logout');
            navigate("/", { replace: true });
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <header>
                <h1 className=""><img className='is-centered' src={isAdmin == 1 ? ("/assets/icon-left-font.svg") : ("/assets/icon-left-font-monochrome-black.svg")} width="200" alt="Groupomania" /></h1>
                <div className="tabs is-centered">
                    <ul>
                        <li>
                            <NavLink to="home" className={({ isActive }) => (isActive ?
                                (isAdmin == 1 ? ('nav-active-admin') : ('nav-active')) : (isAdmin == 1 ? ('inactive-admin') : ('inactive')))}>
                                <span>Home</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={'profile/' + myId}
                                onClick={() => navigate(`/profile/${myId}`, { replace: true })}
                                className={({ isActive }) => (isActive ?
                                    (isAdmin == 1 ? ('nav-active-admin') : ('nav-active')) : (isAdmin == 1 ? ('inactive-admin') : ('inactive')))}>
                                <span>Profil</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="settings" className={({ isActive }) => (isActive ?
                                (isAdmin == 1 ? ('nav-active-admin') : ('nav-active')) : (isAdmin == 1 ? ('inactive-admin') : ('inactive')))}>
                                <span>Éditer mon profil</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="logout" className={({ isActive }) => (isActive ?
                                (isAdmin == 1 ? ('nav-active-admin') : ('nav-active')) : (isAdmin == 1 ? ('inactive-admin') : ('inactive')))}>
                                <span>Se déconnecter</span>
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </header>
        </>
    )
}

export default Header