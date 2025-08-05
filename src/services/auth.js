import Cookies from 'js-cookie';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const ROL_KEY = 'rol';
const SESSION_TIMEOUT = 1; // minutos

export const saveToken = (token) => {
    const expires = new Date(new Date().getTime() + SESSION_TIMEOUT * 60 * 1000);
    Cookies.set(TOKEN_KEY, token, { expires, secure: true, sameSite: 'strict' });
};

export const getToken = () => {
    return Cookies.get(TOKEN_KEY);
};

export const saveUser = (user) => {
    const expires = new Date(new Date().getTime() + SESSION_TIMEOUT * 60 * 1000);
    Cookies.set(USER_KEY, JSON.stringify(user), { expires, secure: true, sameSite: 'strict' });
};

export const getUser = () => {
    const user = Cookies.get(USER_KEY);
    return user ? JSON.parse(user) : null;
};

export const saveRol = (rol) => {
    const expires = new Date(new Date().getTime() + SESSION_TIMEOUT * 60 * 1000);
    Cookies.set(ROL_KEY, JSON.stringify(rol), { expires, secure: true, sameSite: 'strict' });
};

export const getRol = () => {
    const rol = Cookies.get(ROL_KEY);
    return rol ? JSON.parse(rol) : null;
};

export const logoutOscar = () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_KEY);
    Cookies.remove(ROL_KEY);
};