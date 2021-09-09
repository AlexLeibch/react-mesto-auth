import React from "react"
import headerLogo from '../vendor/image/header_logo.svg'

function Header() {
    return (
        <header className="header">
            <img src={headerLogo} alt="лого шапки" className="header__logo"/>
        </header>
    )
}

export default Header