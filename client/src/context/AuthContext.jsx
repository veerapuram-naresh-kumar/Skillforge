
import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for user
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const register = async (name, email, password) => {
        console.log("AuthContext: Registering...", { name, email });
        try {
            const res = await axios.post("http://localhost:5000/api/auth/register", {
                name,
                email,
                password,
            });
            console.log("AuthContext: Registration success", res.data);
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
            return { success: true };
        } catch (error) {
            console.error("AuthContext: Registration error", error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || "Registration failed",
            };
        }
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            });
            setUser(res.data);
            localStorage.setItem("user", JSON.stringify(res.data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Login failed",
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    return useContext(AuthContext);
};
