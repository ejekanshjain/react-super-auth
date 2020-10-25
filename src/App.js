import React, { useState, useEffect } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import fetcher from './util/fetcher'
import { AuthContext } from './context/useAuth'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Profile from './pages/Profile'

const App = () => {
    const [user, setUser] = useState({
        userId: '',
        role: '',
        token: '',
        refreshToken: '',
        issuedAt: 0,
        expiresAt: 0
    })

    const getUser = () => user

    const signIn = async (email = '', password = '') => {
        if (!email) throw new Error('Email is required!')
        if (!password) throw new Error('Password is required!')
        let e
        try {
            const res = await fetcher('/signIn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            const json = await res.json()
            if (res.status !== 200) {
                e = json.message || 'Something Went Wrong'
            } else {
                const authUser = {
                    userId: json.userId,
                    role: json.role,
                    token: json.token,
                    refreshToken: json.refreshToken,
                    issuedAt: json.issuedAt,
                    expiresAt: json.expiresAt
                }
                localStorage.setItem('REACT_SUPER_AUTH_USER', JSON.stringify(authUser))
                setUser(authUser)
            }
        } catch (err) {
            console.log('err', err)
        }
        if (e) {
            throw new Error(e)
        }
    }

    const signUp = async (firstName = '', lastName = '', email = '', password = '', confirmPassword = '') => {
        const regex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
        if (!firstName) throw new Error('First Name is required!')
        if (!lastName) throw new Error('Last Name is required!')
        if (!email) throw new Error('Email is required!')
        if (!password) throw new Error('Password is required!')
        if (!confirmPassword) throw new Error('Confirm Password is required!')
        if (password.length < 8) throw new Error('PPassword length must be atleast 8')
        if (!regex.test(password)) throw new Error('Password must contain atleast one upper case letter, one lower case letter, one number and one special character')
        if (password !== confirmPassword) throw new Error('Passwords Do not match!')
        let e
        try {
            const res = await fetcher('/signUp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ firstName, lastName, email, password, confirmPassword })
            })
            if (res.status !== 201) {
                const json = await res.json()
                e = json.message || 'Something Went Wrong'
            }
        } catch (err) {
            console.log('err', err)
        }
        if (e) {
            throw new Error(e)
        }
    }

    const getToken = async () => {
        if (Date.now() >= (user.expiresAt - 1000)) {
            try {
                const res = await fetcher('refreshToken', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ refreshToken: user.refreshToken })
                })
                const json = await res.json()
                if (res.status === 200) {
                    const authUser = {
                        userId: json.userId,
                        role: json.role,
                        token: json.token,
                        refreshToken: json.refreshToken,
                        issuedAt: json.issuedAt,
                        expiresAt: json.expiresAt
                    }
                    localStorage.setItem('REACT_SUPER_AUTH_USER', JSON.stringify(authUser))
                    setUser(authUser)
                    return authUser
                } else {
                    localStorage.removeItem('REACT_SUPER_AUTH_USER')
                    setUser({
                        userId: '',
                        role: '',
                        token: '',
                        refreshToken: '',
                        issuedAt: 0,
                        expiresAt: 0
                    })
                }
            } catch (err) {
                console.log(err)
            }
        } else {
            return user
        }
    }

    const authFetch = async (url, options) => {
        const { token } = await getToken()
        options.headers.Authorization = token
        const res = await fetcher(url, options)
        return res
    }

    const signOut = async () => {
        const { token, refreshToken } = await getToken()
        await fetcher('/signOut', {
            method: 'POST',
            headers: {
                Authorization: token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ refreshToken })
        })
        localStorage.removeItem('REACT_SUPER_AUTH_USER')
        setUser({
            userId: '',
            role: '',
            token: '',
            refreshToken: '',
            issuedAt: 0,
            expiresAt: 0
        })
    }

    useEffect(() => {
        const authUser = localStorage.getItem('REACT_SUPER_AUTH_USER')
        const refresh = async user => {
            if (Date.now() >= (user.expiresAt - 1000)) {
                try {
                    const res = await fetcher('refreshToken', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ refreshToken: user.refreshToken })
                    })
                    const json = await res.json()
                    if (res.status === 200) {
                        const authUser = {
                            userId: json.userId,
                            role: json.role,
                            token: json.token,
                            refreshToken: json.refreshToken,
                            issuedAt: json.issuedAt,
                            expiresAt: json.expiresAt
                        }
                        localStorage.setItem('REACT_SUPER_AUTH_USER', JSON.stringify(authUser))
                        setUser(authUser)
                    } else {
                        localStorage.removeItem('REACT_SUPER_AUTH_USER')
                        setUser({
                            userId: '',
                            role: '',
                            token: '',
                            refreshToken: '',
                            issuedAt: 0,
                            expiresAt: 0
                        })
                    }
                } catch (err) {
                    console.log(err)
                }
            }
        }
        if (authUser) {
            try {
                const decoded = JSON.parse(authUser)
                if (decoded && decoded.userId && decoded.token && decoded.refreshToken && decoded.issuedAt && decoded.expiresAt)
                    refresh(decoded)
            } catch {
            }
        }
    }, [])

    const value = {
        signIn,
        signUp,
        signOut,
        getUser,
        authFetch
    }

    return (
        <AuthContext.Provider value={value}>
            <Switch>
                <Route path='/' component={Home} exact />
                {!user.userId && <Route path='/auth' component={Auth} exact />}
                {user.userId && <Redirect from='/auth' to='/profile' />}
                {user.userId && <Route path='/profile' component={Profile} exact />}
                {!user.userId && <Redirect from='/profile' to='/auth' />}
                <Redirect from='*' to='/' />
            </Switch>
        </AuthContext.Provider>
    )
}

export default App