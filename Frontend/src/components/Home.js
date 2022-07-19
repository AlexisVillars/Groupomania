import React, { Component } from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams, NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import TimeAgo from 'timeago-react';
import * as timeago from 'timeago.js';
import fr from 'timeago.js/lib/lang/fr';
timeago.register('fr', fr);


const Dashboard = () => {
    const [myId, setId] = useState('');
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [userImg, setUserImg] = useState('');
    const [postImg, setPostImg] = useState('');
    const [AllUsers, setAllUser] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setAdmin] = useState('');
    const [token, setToken] = useState('');
    const [expire, setExpire] = useState('');
    const [posts, setPosts] = useState([]);
    const [comments, setComments] = useState([]);
    const [msg, setMsg] = useState('');
    const navigate = useNavigate();

    const location = useLocation();
    const { id } = useParams();

    useEffect(() => {
        refreshToken();
        getMyAllUser();
        getPosts();
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
        postMsg: "",

    };

    const validationSchema = Yup.object().shape({
        postMsg: Yup.string().min(1, "Le message doit contenir au moins 1 caractère").required(""),

    });

    const initialValuesComment = {
        commentMsg: "",
        hiddenField: "",
    };

    const validationSchemaComment = Yup.object().shape({
        commentMsg: Yup.string().min(1, "Le message doit contenir au moins 1 caractère").required(""),
        hiddenField: Yup.string()
    });

    const onSubmit = async (data, { resetForm }) => {
        try {
            const formData = new FormData;
            formData.append('postMsg', data.postMsg);
            if (postImg != userImg) {
                formData.append('postImg', postImg)
            }
            await axios.post('http://localhost:5000/posts', formData);
            let inputvalueimg = document.getElementById("postimgid");
            inputvalueimg.value = "";
            setPostImg("")
            resetForm({ values: '' });
            navigate("/home", { replace: true });
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg);
            }
        }
    };

    const onSubmitcomment = async (data, { resetForm }) => {
        try {
            await axios.post(`http://localhost:5000/comments/id/${id}`, data);
            setComments(comments);
            resetForm({ values: '' });
            navigate("/home", { replace: true });
        } catch (error) {
            if (error.response) {
                setMsg(error.response.data.msg);
            }
        }
    };

    const getPosts = async () => {
        const response = await axiosJWT.get('http://localhost:5000/posts', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setPosts(response.data);
    }



    const deletePost = async (postId) => {
        try {
            if (window.confirm("Voulez-vous vraiment supprimer ce message ?")) {
                await axios.delete(`http://localhost:5000/posts/id/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                navigate("/home", { replace: true });
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
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const getMyAllUser = async () => {
        const response = await axiosJWT.get(`http://localhost:5000/users/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        setAllUser(response.data);
    }

    const LastSeen = (date) => {
        return (<TimeAgo datetime={date} locale='fr' />);
    }

    function parseJwt(token) {
        if (!token) { return; }
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }

    const user = parseJwt(token);

    return (
        <>
            <section className="mesInfos">
                <div className="card">
                    <div className="card-content">
                        <div className="media">
                            <div className="media-left">
                                <figure className="image is-48x48">
                                    <img className="userImg is-rounded" src={'images/profilepictures/' + userImg} alt='pp' />
                                </figure>
                            </div>
                            <div className="media-content">
                                <div className="publish-post">
                                    <Formik initialValues={initialValues} onSubmit={onSubmit} validationSchema={validationSchema} enableReinitialize={true}>
                                        <Form>
                                            {msg ? (<p className="notification is-danger is-size-6 p-2 mt-1">{msg}</p>) : ("")}
                                            <div className="field">
                                                <div className="controls grow-wrap">
                                                    <Field name="postMsg" as="textarea" placeholder={'Alors ' + prenom + ', quoi de neuf ?'} autoComplete="off" className="textarea is-dark-light" rows="2"></Field>
                                                </div>
                                                <ErrorMessage name="postMsg" component="p" className="notification is-danger is-italic is-light p-2 mt-2" />
                                            </div>
                                            <input id="postimgid" name='postImg' type="file" onChange={(event) => setPostImg(event.currentTarget.files[0])} />
                                            <button type='submit' className="button is-pulled-right is-link is-outlined mt-4">Envoyer</button>
                                        </Form>
                                    </Formik>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="tousLesMessages mt-5">
                {posts.map((post, index) => {
                    // console.log(post)
                    return (
                        <div key={index} className="card mb-5" id={post.id}>
                            <div className="card-content">
                                <div className="media">
                                    <div className="media-left">
                                        <figure className="image is-48x48">
                                            <img className="userImg is-rounded" src={'../images/profilepictures/' + post.user.userImg} alt='pp' />
                                        </figure>
                                    </div>
                                    <div className="media-content">
                                        <p className="">
                                            <NavLink to={'../profile/' + post.userId}
                                                className={post.user.isAdmin === 1 ? ("title is-size-6 has-text-danger-dark mb-1") : ("title is-size-6 has-text-info-dark mb-5")}>
                                                {post.user.prenom} {post.user.nom}</NavLink><span className="has-text-grey has-text-weight-light ml-1">{post.user.email}</span>
                                        </p>
                                        <p className="is-size-7 has-text-grey">{LastSeen(post.createdAt)}</p>
                                        {isAdmin == 1 ? (<button type='button' className="button is-pulled-right is-danger is-outlined" onClick={() => { deletePost(post.id) }}>Supprimer</button>) : post.userId == user.userId ? (<button type='button' className="button is-pulled-right is-danger is-outlined" onClick={() => { deletePost(post.id) }}>Supprimer</button>) : ('')}
                                    </div>
                                </div>
                                {post.postImg
                                    ? <div className="content">
                                        <img src={'../images/postpictures/' + post.postImg} alt='pp' />
                                        <p>{post.postMsg}</p>
                                    </div>
                                    : <div className="content">
                                        <p>{post.postMsg}</p>
                                    </div>}

                                {post.comments.map((com, index) => {

                                    const found = AllUsers.find(obj => {
                                        return obj.id === com.userId;
                                    });
                                    //console.log(found)

                                    return (
                                        < div key={index}
                                            className={comments.length < 2 ? ("card") : ("card cardList")} >
                                            <div className="card-content">
                                                <div className="media">
                                                    <div className="media-left">
                                                        <figure className="image is-48x48">
                                                            <img className="userImg is-rounded" src={'../images/profilepictures/' + found.userImg} alt='pp' />
                                                        </figure>
                                                    </div>
                                                    <div className="media-content">
                                                        <p className={post.user.isAdmin == 1 ? ("title is-size-6 has-text-danger-dark mb-5") : ("title is-size-6 has-text-info-dark mb-5")}>
                                                            {found.prenom} {found.nom} <span className="has-text-grey has-text-weight-light">{found.email}</span>
                                                        </p>
                                                        <p className="subtitle is-size-7 has-text-grey">{LastSeen(post.createdAt)}</p>
                                                    </div>
                                                </div>
                                                <div className="content pb-5">
                                                    <p>{com.commentMsg}</p>
                                                    {isAdmin == 1 ? (<button type='button' className="button is-pulled-right is-danger is-outlined" onClick={() => { deleteCom(com.id) }}>Supprimer</button>) : post.userId == user.userId ? (<button type='button' className="button is-pulled-right is-danger is-outlined" onClick={() => { deleteCom(com.id) }}>Supprimer</button>) : ('')}


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
                                                    <Formik initialValues={initialValuesComment} onSubmit={onSubmitcomment} validationSchema={validationSchemaComment} enableReinitialize={true}>
                                                        {({ setFieldValue }) => (
                                                            <Form>
                                                                {msg ? (<p className="notification is-danger is-size-6 p-2 mt-1">{msg}</p>) : ("")}
                                                                <div className="field">
                                                                    <div className="controls grow-wrap">
                                                                        <Field name="commentMsg" as="textarea" placeholder={'Un commentaire, ' + prenom + ' ?'} autoComplete="off" className="textarea is-dark-light" rows="2"></Field>
                                                                        <input type="hidden" value="testing" name="hiddenField" />
                                                                    </div>
                                                                    <ErrorMessage name="commentMsg" component="p" className="notification is-danger is-italic is-light p-2 mt-2" />
                                                                </div>
                                                                <button type='submit' className="button is-pulled-right is-link is-outlined mt-4" onClick={() => { setFieldValue("hiddenField", post.id) }}>Commenter</button>
                                                            </Form>
                                                        )}
                                                    </Formik>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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