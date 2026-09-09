import { createContext, useContext, useReducer, useEffect } from 'react';
import API from '../services/api';

// ========== INITIAL STATE ==========
const initialState = {
    user: null,
    token: localStorage.getItem('token') || null,
    loading: true,
    error: null
};

// ========== REDUCER ==========
const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                loading: false,
                error: null
            };
        case 'REGISTER_SUCCESS':
            return {
                ...state,
                loading: false,
                error: null
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                token: null,
                loading: false,
                error: null
            };
        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false
            };
        case 'SET_LOADING':
            return {
                ...state,
                loading: true
            };
        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
                loading: false
            };
        default:
            return state;
    }
};

// ========== CONTEXT ==========
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Load user on mount
    useEffect(() => {
        const loadUser = async () => {
            if (!state.token) {
                dispatch({ type: 'SET_LOADING' });
                dispatch({ type: 'SET_USER', payload: null });
                return;
            }

            try {
                const res = await API.get('/profile', {
                    headers: { Authorization: `Bearer ${state.token}` }
                });
                dispatch({ type: 'SET_USER', payload: res.data });
            } catch (error) {
                localStorage.removeItem('token');
                dispatch({ type: 'LOGOUT' });
            }
        };

        loadUser();
    }, [state.token]);

    // ========== LOGIN ==========
    const login = async (email, password) => {
        try {
            const res = await API.post('/login', { email, password });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });

            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            dispatch({ type: 'SET_ERROR', payload: message });
            return { success: false, message };
        }
    };

    // ========== REGISTER ==========
    const register = async (name, email, password, role = 'user') => {
        try {
            await API.post('/register', { name, email, password, role });
            dispatch({ type: 'REGISTER_SUCCESS' });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            dispatch({ type: 'SET_ERROR', payload: message });
            return { success: false, message };
        }
    };

    // ========== LOGOUT ==========
    const logout = () => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
    };

    return (
        <AuthContext.Provider value={{
            user: state.user,
            token: state.token,
            loading: state.loading,
            error: state.error,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// ========== CUSTOM HOOK ==========
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};