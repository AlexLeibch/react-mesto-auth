import '../index.css';
import React from 'react';

import registrationAccept from '../vendor/image/AcceptRegistration.svg'
import registrationReject from '../vendor/image/RejectRegistration.svg'

import Header  from './Header';
import Footer from './Footer';
import Main from './Main';
import PopupWithForm from './PopupWithForm';
import ImagePopup from './ImagePopup';
import api from '../utils/api';
import {CurrentUserContext} from '../contexts/CurrentUserContext';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';

import Login from './Login'
import Register from './Register'
import ProtectedRoute from './ProtectedRoute';
import {Switch, Redirect, Route, useHistory} from 'react-router-dom'
import InfoTooltip from './InfoTooltip';
import * as auth from '../utils/auth'

function App() {

    const history = useHistory()

    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = React.useState(false)
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false)
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = React.useState(false)
    const [selectedCard, setSelectedCards] = React.useState({isOpen: false})
    const [currentUser, setCurrentUser] = React.useState('')
    const [cards, setCards] = React.useState([])
    const [isToooltipOpen, setIsTooltipOpen] = React.useState(false)

    const [loggedIn, setLoggedIn] = React.useState(false)
    const [message, setMessage] = React.useState({imgPath: '', text: ''})
    const [email, setEmail] = React.useState('')


    React.useEffect(()  => {
        api.getInitialCards()
            .then(data => {
                setCards(data)
            })
            .catch((err) => {
                console.log(err)
            });
    }, [])


    function handleCardLike(card) {
        const isLiked = card.likes.some(i => i._id === currentUser._id);
        api.changeLikeCardStatus(card._id, !isLiked)
        .then((newCard) => {
            console.log(newCard)
            const newCards = cards.map((currentCard) => currentCard._id === card._id ? newCard : currentCard)
            setCards(newCards)
        })
        .catch((err) => {
            console.log(err)
        })  
    }
    
    function handleCardDelete(card) {
        api.removeCard(card._id)
        .then(() => {
            const newCards = cards.filter((elem) => elem !== card);
            setCards(newCards)
        })
    }

    React.useEffect(() => {
        api.getUserInfo()
        .then(data => {
            setCurrentUser(data)
        })
        .catch((err) => {
            console.log(err)
        })
    }, [])  

    React.useEffect(() => {
        const jwt = localStorage.getItem('jwt')
        if(jwt) {
            auth.getContent(jwt)
                .then((res) => {
                    setLoggedIn(true)
                    setEmail(res.data.email)
                    history.push('/')
                })
                .catch((err) => console.log(err))
        }
    }, [history])



    function handleEditAvatarClick () {
        setIsEditAvatarPopupOpen(true)
    }

    function handleEditProfileClick () {
        setIsEditProfilePopupOpen(true)
    }

    function handleAddPlaceClick () {
        setIsAddPlacePopupOpen(true)
    }

    function HandleCardClick({name, link, isOpen}) {
        setSelectedCards({name, link, isOpen: !isOpen})
    }

    function closeAllPopups() {
        setIsEditProfilePopupOpen(false)
        setIsEditAvatarPopupOpen(false)
        setIsAddPlacePopupOpen(false)
        setSelectedCards({isOpen: false})
        setIsTooltipOpen(false)
    }

    function handleUpdateUser({name, about}) {
        api.editUserInfo(name, about)
        .then((data) => {
            setCurrentUser(data)
            closeAllPopups()
        })
        .catch((err) =>{
            console.log(err)
        })
    }

    
    function handleAddPlaceSubmit({name,link}) {
        api.addCard(name,link)

        .then((data) => {
            setCards([data, ...cards])
            closeAllPopups()
        })
        .catch((err) => {
            console.log(err)
        })
    }

    
    function handleUpdateAvatar({avatar}) {
        api.editUserAvatar(avatar)
        .then((data) => {
            setCurrentUser(data)
            closeAllPopups()
        }) 
        .catch((err) => {
            console.log(err)
        })
    }

    function handleSignOut() {
        setLoggedIn(false);
        localStorage.removeItem('jwt');
        setEmail('')
        history.push('/sign-in')
    }



    function handleToolltipInfoOpen() {
        setIsTooltipOpen(true)
    }

    function registration({email, password}) {
        auth.register(email, password)
        .then((res) => {
            if (res.status === 201) {
                handleTooltipInfo({imgPath: registrationAccept, text: 'Вы успешно зарегестрированы'})
                handleToolltipInfoOpen()
                history.push('/sign-in')
            }
            })
        .catch((err) => {
            handleTooltipInfo({imgPath: registrationReject, text: 'Что - то пошло не так'})
            handleToolltipInfoOpen()
            console.log(err)
        })
    }

    function authorization({email, password}) {
        auth.authorize({email, password})
        .then((data) => {
            if (!data) {
                return
            }
        setLoggedIn(true);
        handleTooltipInfo({imgPath: registrationAccept, text: 'Вы успешно авторизированы'});
        history.push('/')
        handleToolltipInfoOpen()

        }).catch((err) => {
            handleTooltipInfo({imgPath: registrationReject, text: 'Что - то пошло не так'})
            handleToolltipInfoOpen()

            console.log(err)

        })
    };

    function handleTooltipInfo({imgPath, text}) {
        setMessage({imgPath, text})
    }

  return (
      <CurrentUserContext.Provider value={currentUser}>
        <div className="page">
            <div className="page__root">
            <Header handleSignOut={handleSignOut}/>
                <Switch>
                    <Route path="/sign-in">
                        <Login authorization={authorization}/>
                    </Route>
                    <Route path="/sign-up">
                        <Register registration={registration}/>
                    </Route>
                    <ProtectedRoute exact path="/main" component={Main} onEditProfile={handleEditProfileClick} onAddPlace={handleAddPlaceClick}
                        onEditAvatar={handleEditAvatarClick} onCardClick={HandleCardClick} onCardLike={handleCardLike} onCardDelete={handleCardDelete} cards={cards}
                        loggedIn={loggedIn}>
                    </ProtectedRoute>
                    <Route path="/">
                        {loggedIn ? <Redirect to="/main"/> : <Redirect to="/sign-in"/>}
                    </Route>
                </Switch>
                <Footer/>
                <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser}/>
                <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar}/>
                <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit}/>
                <PopupWithForm
                    title="Вы уверены?"
                    name="remove-card"
                    buttonText="Да"
                    onClose={closeAllPopups}>
                </PopupWithForm>
                <ImagePopup
                    card={selectedCard}
                    onClose={closeAllPopups}/>
                <InfoTooltip onClose={closeAllPopups} isOpen={isToooltipOpen} message={message}/>
            </div>
        </div>
        </CurrentUserContext.Provider>
  );
}

export default App;



// eslint-disable-next-line no-lone-blocks
{/* <section className="popup popup_type_profile">
            <div className="popup__container">
                <button type="button" className="popup__button-close"></button>
                <h2 className="popup__title">Редактировать профиль</h2>
                <form  name="profilePopup" className="popup__form popup__form-profile" noValidate>
                    <input id="form-name-input" type="text" name="name" defaultValue="Имя" placeholder="Имя" 
                    required minLength="2" maxLength="40" className="popup__field popup__field_type_name"/>
                    <span  className="form-name-input-error"></span>
                    <input id="form-description-input" type="text" name="description" defaultValue="описание" placeholder="описание" 
                    required minLength="2" maxLength="200" className="popup__field popup__field_type_description"/>
                    <span  className="form-description-input-error"></span>

                </form>
            </div>
        </section>
        <section className="popup popup_type_cardpopup">
            <div className="popup__container">
                <button type="button" className="popup__button-close  popup__button-close_card-add"></button>
                <h2 className="popup__title">Новое место</h2>
                <form name="popup-card" className="popup__form popup__form-card" noValidate>
                    <input type="text" id="form-place-input"  name="placeName"  placeholder="Название" 
                     minLength="2" maxLength="30" required className="popup__field popup__field_type_place"/>
                     <span className="form-place-input-error"></span>
                    <input type="url" id="form-link-input" name="form-link-input"  placeholder="Ссылка на картинку" 
                    required minLength="2" className="popup__field popup__field_type_imageUrl"/>
                    <span className="form-link-input-error"></span>
                    <button  type="submit" className="popup__button-save">Создать</button>
                </form> 
            </div>
        </section>

        <section className="popup popup_type_avatarpopup">
            <div className="popup__container">
                <button type="button" className="popup__button-close popup__button-close_edit-avatar"></button>
                <h2 className="popup__title">Обновить аватар</h2>
                <form name="popup-avatar"  className="popup__form popup__form-avatar"  noValidate>
                    <input type="url" id="form-avatar" className="popup__field popup__field_avatar_imageUrl" placeholder="Ссылка на аватар"/>
                    <span className="form-avatar-error" id="form-avatar-error"></span>
                    <button type="submit" className="popup__button-save">Создать</button>
                </form>
            </div>
        </section>
        <section className="popup popup_type_deleteimage">
            <div className="popup__container popup__container_size_small">
                <button className="popup__button-close popup__button-close_delete-profile"></button>
                <h2 className="popup__title">Вы уверены?</h2>
                <form action="" className="popup__form popup__form_edit-margin">
                    <button className="popup__button-save">Да</button>
                </form>
            </div>
        </section>
    </div>
    <template className="elements-template">
        <div className="element card">
          <img src="#" alt="#" className="element__image"/>
          <button className="element__delete-button" type="button"></button>
          <h2 className="element__title"></h2>
          <div className="element__like-button-container">
            <button className="element__like-button" type="button"></button>
            <p className="element__like-counter">0</p>
          </div>
        </div>
      </template> */}