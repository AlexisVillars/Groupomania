import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation, NavLink } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

import TimeAgo from 'timeago-react';
import * as timeago from 'timeago.js';
import fr from 'timeago.js/lib/lang/fr';
timeago.register('fr', fr);


const Dashboard = () => {
    const [Id, setId] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [userImg, setUserImg] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setAdmin] = useState('');
    const [token, setToken] = useState('');
    const [expire, setExpire] = useState('');
    const [comments, setComments] = useState([]);
    const [post, setPost] = useState([]);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const { id } = useParams();
    const location = useLocation()

    useEffect(() => {
        refreshToken();
        getMyPost();
        getComByPost();
    }, [location.key]);
    const refreshToken = async () => {
        try {
            const response = await axios.get('http://localhost:5000/users/token');
            setToken(response.data.accessToken);
            const decoded = jwt_decode(response.data.accessToken);
            setId(decoded.userId);
            setNom(decoded.nom);
            setPrenom(decoded.prenom);
            setUserImg(decoded.userImg);
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
        commentMsg: ""
    };

    const validationSchema = Yup.object().shape({
        commentMsg: Yup.string().min(1, "Le message doit contenir au moins 1 caractère").required("")
    });

    const onSubmit = async (data, { resetForm }) => {
        console.log(data);
        try {
            await axios.post(`http://localhost:5000/comments/id/${id}`, data);
            setComments(comments);
            resetForm({ values: '' });
            const urlTo = "../post/" + id;
            navigate(urlTo, { replace: true });
            // window.location.reload();
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg);
            }
        }
    };
    function parseJwt(token) {
        if (!token) { return; }
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }
    const user = parseJwt(token);


    const getMyPost = async () => {
        const response = await axiosJWT.get(`http://localhost:5000/posts/id/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setPost(response.data);
    }

    const getComByPost = async () => {
        const response = await axiosJWT.get(`http://localhost:5000/comments/id/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setComments(response.data);
    }

    const deletePost = async (postId) => {
        try {
            if (window.confirm("Voulez-vous vraiment supprimer ce message ?")) {
                await axios.delete(`http://localhost:5000/posts/id/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // navigate("/profile", { replace: true }); 
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deleteCom = async (comId) => {
        try {
            if (window.confirm("Voulez-vous vraiment supprimer ce commentaire ?")) {
                await axios.delete(`http://localhost:5000/comments/id/${comId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // navigate("/profile", { replace: true }); 
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const LastSeen = (date) => {
        return (<TimeAgo datetime={date} locale='fr' />);
    }

    return (
        <>
            <section className="mesInfos">
                {post.slice(0).reverse().map((post, index) => {
                    return (
                        <div key={index} className="card postPage">
                            <div className="card-content">
                                <div className="media">
                                    <div className="media-left">
                                        <figure className="image is-48x48">
                                            <img className="userImg is-rounded" src={'../images/profilepictures/' + post.user.userImg} alt='pp' />
                                        </figure>
                                    </div>
                                    <div className="media-content">
                                        {/* <p className={post.user.isAdmin === 1 ? ("title is-size-6 has-text-danger-dark mb-5") : ("title is-size-6 has-text-info-dark mb-5")}>
                      {post.user.prenom} {post.user.nom} <span className="has-text-grey has-text-weight-light">{post.user.email}</span>
                      </p> */}
                                        <p className="">
                                            <NavLink to={'../profile/' + post.userId}
                                                className={post.user.isAdmin == 1 ? ("title is-size-6 has-text-danger-dark mb-1") : ("title is-size-6 has-text-info-dark mb-5")}>
                                                {post.user.prenom} {post.user.nom}</NavLink><span className="has-text-grey has-text-weight-light ml-1">{post.user.email}</span>
                                        </p>
                                        <p className="subtitle is-size-7 has-text-grey">{LastSeen(post.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="content pb-5">
                                    <p>{post.postMsg}</p>
                                    {isAdmin == 1 ? (<button type='button' className="button is-pulled-right is-danger is-outlined" onClick={() => { deletePost(post.id) }}>Supprimer</button>) : post.userId == user.userId ? (<button type='button' className="button is-pulled-right is-danger is-outlined" onClick={() => { deletePost(post.id) }}>Supprimer</button>) : ('')}
                                </div>
                            </div>
                        </div>
                    )
                })}

                <div className="card postPageForm mb-5">
                    <div className="card-content">
                        <div className="media">
                            <div className="media-left">
                                <figure className="image is-48x48">
                                    <img className="userImg is-rounded" src={'../images/profilepictures/' + userImg} alt='pp' />
                                </figure>
                            </div>
                            <div className="media-content">
                                <div className="publish-post">
                                    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} enableReinitialize={true}>
                                        <Form>
                                            {msg ? (<p className="notification is-danger is-size-6 p-2 mt-1">{msg}</p>) : ("")}
                                            <div className="field">
                                                <div className="controls grow-wrap">
                                                    <Field name="commentMsg" as="textarea" placeholder={'Un commentaire, ' + prenom + ' ?'} autoComplete="off" className="textarea is-dark-light" rows="2"></Field>
                                                </div>
                                                <ErrorMessage name="commentMsg" component="p" className="notification is-danger is-italic is-light p-2 mt-2" />
                                            </div>
                                            <button type='submit' className="button is-pulled-right is-link is-outlined mt-4">Commenter</button>
                                        </Form>
                                    </Formik>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="tousLesMessages comlist">
                {comments.map((com, index) => {

                    return (
                        <div key={index}
                            className={comments.length < 2 ? ("card") : ("card cardList")}>
                            <div className="card-content">
                                <div className="media">
                                    <div className="media-left">
                                        <figure className="image is-48x48">
                                            <img className="userImg is-rounded" src={'../images/profilepictures/' + com.user.userImg} alt='pp' />
                                        </figure>
                                    </div>
                                    <div className="media-content">
                                        <p className={com.user.isAdmin == 1 ? ("title is-size-6 has-text-danger-dark mb-5") : ("title is-size-6 has-text-info-dark mb-5")}>
                                            {com.user.prenom} {com.user.nom} <span className="has-text-grey has-text-weight-light">{com.user.email}</span>
                                        </p>
                                        <p className="subtitle is-size-7 has-text-grey">{LastSeen(com.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="content pb-5">
                                    <p>{com.commentMsg}</p>
                                    {isAdmin == 1 ? (<button type='button' className="button is-pulled-right is-danger is-outlined" onClick={() => { deleteCom(com.id) }}>Supprimer</button>) : com.userId == user.userId ? (<button type='button' className="button is-pulled-right is-danger is-outlined" onClick={() => { deleteCom(com.id) }}>Supprimer</button>) : ('')}


                                </div>
                            </div>
                        </div>
                    )
                })}

            </section>
        </>
    );
}

export default Dashboard