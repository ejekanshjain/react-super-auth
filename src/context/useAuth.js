import { createContext, useContext } from 'react'

const AuthContext = createContext({
    signIn: async (email, password) => { },
    signUp: async (firstName, lastName, email, password, confirmPassword) => { },
    signOut: async () => { },
    getUser: () => ({
        userId: '',
        role: '',
        token: '',
        refreshToken: '',
        issuedAt: 0,
        expiresAt: 0
    }),
    authFetch: async (url = '', options = {}) => { }
})

const useAuth = () => {
    return useContext(AuthContext)
}

export { AuthContext }
export default useAuth