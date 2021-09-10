import React from "react";
import {Link} from 'react-router-dom'
function Register() {
    return (
        <section className="login">
        <h1 className="login__title">Регистрация</h1>
        <form className="login__form">
            <input  className="login__input" placeholder="Email"/>
            <input  className="login__input" placeholder="Пароль"/>
            <button className="login__button-submit">Войти</button>
        </form>
        <Link className="login__link" to="/sign-in">Уже зарегестрированы? Войти</Link>
    </section>
    )
}

export default Register