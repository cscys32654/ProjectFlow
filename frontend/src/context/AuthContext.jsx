import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../api/endpoints';

const AuthContext = createContext(null);

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':  return { ...state, user: action.payload, loading: false };
    case 'LOGOUT':    return { user: null, loading: false };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    default: return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { user: null, loading: true });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { dispatch({ type: 'SET_USER', payload: null }); return; }
    authAPI.me()
      .then(res => dispatch({ type: 'SET_USER', payload: res.data.user }))
      .catch(() => { localStorage.removeItem('token'); dispatch({ type: 'LOGOUT' }); });
  }, []);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    dispatch({ type: 'SET_USER', payload: user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);