import React, { useState, useRef, useEffect } from 'react'
import { Card, Form, Button, Alert } from 'react-bootstrap'

import useAuth from '../context/useAuth'

const styles = {
    root: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
}

const Auth = () => {
    const [loading, setLoading] = useState(true)
    const auth = useAuth()

    const [error, setError] = useState('')
    const [, setShowError] = useState(false)
    const showErrorMessage = msg => {
        setError(msg)
        setShowError(true)
    }
    const removeErrorMessage = () => {
        setError('')
        setShowError(false)
    }

    const [suceessMsg, setSuccessMsg] = useState('')
    const [, setShowSuccessMsg] = useState(false)
    const showSuccessMessage = msg => {
        setSuccessMsg(msg)
        setShowSuccessMsg(true)
    }
    const removeSuccessMessage = () => {
        setSuccessMsg('')
        setShowSuccessMsg(false)
    }

    const firstNameRef = useRef()
    const lastNameRef = useRef()
    const emailRef = useRef()
    const passwordRef = useRef()
    const confirmPasswordRef = useRef()

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [authType, setAuthType] = useState('Sign In')
    const changeAuthType = e => {
        e.preventDefault()
        removeErrorMessage()
        removeSuccessMessage()
        setFirstName('')
        setLastName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setAuthType(prevAuthType => prevAuthType === 'Sign In' ? 'Sign Up' : 'Sign In')
    }

    const handleAuth = async e => {
        e.preventDefault()
        removeErrorMessage()
        removeSuccessMessage()
        if (authType === 'Sign In') {
            setLoading(true)
            try {
                await auth.signIn(email, password)
            } catch (err) {
                setLoading(false)
                return showErrorMessage(err.message)
            }
        } else {
            setLoading(true)
            try {
                await auth.signUp(firstName, lastName, email, password, confirmPassword)
            } catch (err) {
                setLoading(false)
                return showErrorMessage(err.message)
            }
            showSuccessMessage('Account creation successful')
            setFirstName('')
            setLastName('')
            setEmail('')
            setPassword('')
            setConfirmPassword('')
            setAuthType('Sign In')
        }
        setLoading(false)
    }

    useEffect(() => {
        setLoading(false)
    }, [])

    return (
        <div style={styles.root}>
            <div className='col-lg-4 col-md-6 col-sm-12'>
                <Card>
                    <Card.Title className='mt-3'>
                        <h3 className='text-center'>
                            {authType}
                        </h3>
                    </Card.Title>
                    <Card.Body>
                        {
                            error &&
                            <Alert className='w-100 text-center' variant='danger' onClose={removeErrorMessage} dismissible>
                                {error}
                            </Alert>
                        }
                        {
                            suceessMsg &&
                            <Alert className='w-100 text-center' variant='success' onClose={removeSuccessMessage} dismissible>
                                {suceessMsg}
                            </Alert>
                        }
                        <Form onSubmit={handleAuth}>
                            {authType === 'Sign Up' &&
                                <>
                                    <Form.Group controlId='firstName'>
                                        <Form.Label>First Name</Form.Label>
                                        <Form.Control type='text' ref={firstNameRef} value={firstName} onChange={() => setFirstName(firstNameRef.current.value.trim())} required />
                                    </Form.Group>
                                    <Form.Group controlId='lastName'>
                                        <Form.Label>Last Name</Form.Label>
                                        <Form.Control type='text' ref={lastNameRef} value={lastName} onChange={() => setLastName(lastNameRef.current.value.trim())} required />
                                    </Form.Group>
                                </>
                            }
                            <Form.Group controlId='email'>
                                <Form.Label>Email</Form.Label>
                                <Form.Control type='email' ref={emailRef} value={email} onChange={() => setEmail(emailRef.current.value.trim())} required />
                            </Form.Group>
                            <Form.Group controlId='password'>
                                <Form.Label>Password</Form.Label>
                                <Form.Control type='password' ref={passwordRef} value={password} onChange={() => setPassword(passwordRef.current.value.trim())} required />
                            </Form.Group>
                            {authType === 'Sign Up' &&
                                <Form.Group controlId='confirm-password'>
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control type='password' ref={confirmPasswordRef} value={confirmPassword} onChange={() => setConfirmPassword(confirmPasswordRef.current.value.trim())} required />
                                </Form.Group>
                            }
                            <Button type='submit' disabled={loading}>{authType}</Button>
                        </Form>
                        <div className='w-100 text-center mt-2'>
                            <a onClick={changeAuthType} href='/auth'>
                                {
                                    authType === 'Sign In' ?
                                        'Don\'t have an account?' :
                                        'Already have an account?'
                                }
                            </a>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </div>
    )
}

export default Auth