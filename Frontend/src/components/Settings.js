import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import reactImageSize from 'react-image-size';
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const Dashboard = () => {
    const [myId, setId] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [userImg, setUserImg] = useState('');
    const [oldUserImg, setOldUserImg] = useState('');
    const [userImgPreview, setUserImgPreview] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setAdmin] = useState('');
    const [token, setToken] = useState('');
    const [expire, setExpire] = useState('');
    const [msg, setMsg] = useState('');
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
            setNom(decoded.nom);
            setPrenom(decoded.prenom);
            setUserImg(decoded.userImg);
            setOldUserImg(decoded.userImg);
            setEmail(decoded.email);
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
            setNom(decoded.nom);
            setPrenom(decoded.prenom);
            setUserImg(decoded.userImg);
            setEmail(decoded.email);
            setAdmin(decoded.isAdmin);
            setExpire(decoded.exp);
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    const initialValues = {
        nom: `${nom}`,
        prenom: `${prenom}`,
        email: `${email}`
    };

    const validationSchema = Yup.object().shape({
        nom: Yup.string().min(2, "Le nom doit contenir au moins 2 caractères").max(15, "Le nom ne doit pas contenir plus de 15 caractères").required("Veuillez entrer votre nom"),
        prenom: Yup.string().min(2, "Le prénom doit contenir au moins 2 caractères").max(15, "Le prénom ne doit pas contenir plus de 15 caractères").required("Veuillez entrer votre prénom"),
        email: Yup.string().email("Veuillez entrer une adresse email valide").required("Veuillez entrer votre adresse email")
    });

    const onImageChange = async (event) => {
        if (event.target.files && event.target.files[0]) {
            // setImagePreview(URL.createObjectURL(event.target.files[0]));
        }
        try {
            const { width, height } = await reactImageSize(URL.createObjectURL(event.target.files[0]));
            if (width <= 250 && height <= 250) {
                setMsg();
                setUserImgPreview(URL.createObjectURL(event.target.files[0]));
                setUserImg(event.target.files[0]);
            } else {
                setMsg("Veuillez sélectionner une image dont les dimensions n'excédent pas 250x250");
                setUserImgPreview();
                setUserImg(oldUserImg);
            }
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg);
            }
        }
    };

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append('nom', data.nom);
            formData.append('prenom', data.prenom);
            formData.append('userImg', userImg);
            formData.append('email', data.email);
            console.log(formData)

            await axios.put(`http://localhost:5000/users/${myId}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTimeout(() => {
                navigate("/home", { replace: true });
            }, 1000)
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg);
            }
        }
    }

    const delUser = async () => {
        try {
            if (window.confirm("Voulez-vous vraiment supprimer votre compte ?")) {
                await axios.delete(`http://localhost:5000/users/${myId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                navigate("/register", { replace: true });
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <div className="message is-dark">
                <h2 className={isAdmin == 1 ? ("message-header has-background-danger") : ("message-header has-background-link")}>Mes informations</h2>
                <div className="message-body">
                    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} enableReinitialize={true}>
                        <Form>
                            {msg ? (<p className="notification is-danger is-size-6 p-2 mt-1">{msg}</p>) : ("")}
                            <div className="field">
                                <label htmlFor='nom' className="label">Nom:</label>
                                <div className="controls">
                                    <Field name="nom" type="text" placeholder="Nom" autoComplete="off" className="input"></Field>
                                </div>
                                <ErrorMessage name="nom" component="p" className="notification is-danger is-italic is-light p-2 mt-2" />
                            </div>
                            <div className="field">
                                <label htmlFor='prenom' className="label">Prénom:</label>
                                <div className="controls">
                                    <Field name="prenom" type="text" placeholder="Prénom" autoComplete="off" className="input"></Field>
                                </div>
                                <ErrorMessage name="prenom" component="p" className="notification is-danger is-italic is-light p-2 mt-1" />
                            </div>
                            <div className="field">
                                <label htmlFor='email' className="label">Email:</label>
                                <div className="controls">
                                    <Field name="email" type="text" placeholder="Email" autoComplete="off" className="input"></Field>
                                </div>
                                <ErrorMessage name="email" component="p" className="notification is-danger is-light p-2 mt-1" />
                            </div>
                            <div className="field">
                                <label htmlFor='userImg' className="label">Image: <small>(250x250 max)</small></label>
                                <div className="controls">
                                    <div className="file">
                                        <label className="file-label">
                                            <input name='userImg' type="file" className="file-input" onChange={onImageChange} />
                                            <span className="file-cta">
                                                <span className="file-icon">
                                                    <i className="fas fa-upload"></i>
                                                </span>
                                                <span className="file-label">
                                                    Envoyez votre image…
                                                </span>
                                            </span>
                                        </label>
                                    </div>
                                    {userImgPreview ? (<img id="imgPreview" src={userImgPreview} alt="preview" width='128' />) : ("")}
                                </div>
                            </div>
                            <button type='submit' className="button is-link is-outlined mt-2">Valider mes changements</button>
                            <button type='button' className="button is-danger is-outlined mt-2 btnDelete" onClick={() => { delUser(myId) }}>Supprimer mon compte</button>
                        </Form>
                    </Formik>
                </div>
            </div>
        </>
    );
}

export default Dashboard