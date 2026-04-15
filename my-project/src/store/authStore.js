import { create } from "zustand";
import axios from "axios";

export const useAuth = create((set) => ({
  currentUser: null,
  loading: false,
  isAuthenticated: false,
  error: null,
  login: async (userCred) => {
    // const { role, ...userCredObj } = userCredWithRole;
    try {
      //set loading true
      set({
        loading: true,
        currentUser: null,
        isAuthenticated: false,
        error: null,
      });
      //make api call
      let res = await axios.post("http://localhost:4000/auth/login", userCred, {
        withCredentials: true,
      });
      //update state
      if (res.status === 200) {
        localStorage.setItem("hasAuthToken", "true");
        set({
          currentUser: res.data?.payload,
          loading: false,
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (err) {
      console.log("err is ", err);
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        //error: err,
        error: err.response?.data?.error || "Login failed",
      });
    }
  },
  logout: async () => {
    try {
      //set loading state
      //make logout api req
      let res = await axios.get("http://localhost:4000/auth/logout", {
        withCredentials: true,
      });
      //update state
      if (res.status === 200) {
        localStorage.removeItem("hasAuthToken");
        set({
          currentUser: null,
          isAuthenticated: false,
          error: null,
          loading: false,
        });
      }
    } catch (err) {
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.error || "Logout failed",
      });
    }
  },
  // restore login
  checkAuth: async () => {
    try {
      if (!localStorage.getItem("hasAuthToken")) {
        set({
          currentUser: null,
          isAuthenticated: false,
          loading: false,
        });
        return;
      }
      set({ loading: true });
      const res = await axios.get("http://localhost:4000/auth/check-auth", {
        withCredentials: true,
        validateStatus: (status) => status < 500,
      });

      if (res.status === 200) {
        set({
          currentUser: res.data.payload,
          isAuthenticated: true,
          loading: false,
        });
        return;
      }

      // Not logged in (401)
      set({
        currentUser: null,
        isAuthenticated: false,
        loading: false,
      });
      localStorage.removeItem("hasAuthToken");
    } catch (err) {
      // other errors
      console.error("Auth check failed:", err);
      set({ loading: false });
    }
  },
}));
