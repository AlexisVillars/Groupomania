import React, { useState } from 'react'
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const Register = () => {
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const initialValues = {
        nom: "",
        prenom: "",
        email: "",
        password: "",
        confPassword: ""
    };

    const validationSchema = Yup.object().shape({
        nom: Yup.string().min(2, "Le nom doit contenir au moins 2 caractères").max(15, "Le nom ne doit pas contenir plus de 15 caractères").required("Veuillez entrer votre nom"),
        prenom: Yup.string().min(2, "Le prénom doit contenir au moins 2 caractères").max(15, "Le prénom ne doit pas contenir plus de 15 caractères").required("Veuillez entrer votre prénom"),
        email: Yup.string().email("Veuillez entrer une adresse email valide").required("Veuillez entrer votre adresse email"),
        password: Yup.string().required("Veuillez entrer un mot de passe"),
        confPassword: Yup.string().required("Veuillez confirmer votre mot de passe")
    });

    const onSubmit = async (data) => {
        console.log(data);
        try {
            await axios.post('http://localhost:5000/users', data);
            navigate("/login", { replace: true });
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg);
            }
        }
    };

    return (
        <>
            <div className="message is-dark">
                <h2 className="message-header has-background-link">S'inscrire</h2>
                <div className="message-body">
                    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema}>
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
                                <label htmlFor='password' className="label">Mot de passe:</label>
                                <div className="controls">
                                    <Field name="password" type="password" placeholder="******" autoComplete="off" className="input"></Field>
                                </div>
                                <ErrorMessage name="password" component="p" className="notification is-danger is-light p-2 mt-1" />
                            </div>
                            <div className="field">
                                <label htmlFor='confPassword' className="label">Confirmation du mot de passe:</label>
                                <div className="controls">
                                    <Field name="confPassword" type="password" placeholder="******" autoComplete="off" className="input"></Field>
                                </div>
                                <ErrorMessage name="confPassword" component="p" className="notification is-danger is-light p-2 mt-1" />
                            </div>
                            <button type='submit' className="button is-link is-outlined mt-2">inscription</button>
                        </Form>
                    </Formik>
                </div>
            </div>
        </>
    )
};

export default Register