import axios from "axios";
import { useState } from "react";
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaSignInAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate()
  const {setAuthUser} = useAuth()
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log({ emailOrUsername, password, rememberMe });
    try {
      const res = await axios.post('/api/users/login/', { emailOrUsername, password })
      localStorage.setItem("chat-app", JSON.stringify(res.data));
      setAuthUser(res.data)
      toast.success(res.data.message);
      console.log(res)
      setIsLoading(false);
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      console.log(error)
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col">
          {/* Header */}
          <div className="bg-indigo-600 p-8 text-center">
            <h2 className="text-white font-bold text-3xl mb-2">Welcome Back</h2>
            <p className="text-indigo-200">Log in to your account to continue</p>
          </div>

          {/* Form */}
          <div className="p-8 space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email or Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <FaEnvelope />
                  </div>
                  <input
                    type="text"
                    placeholder="name@example.com"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <a href="#" className="text-xs text-indigo-600 hover:text-indigo-800">Forgot password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    <FaLock />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign In
                  <FaSignInAlt className="ml-2" />
                </span>
              )}
            </button>

            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a href="/register" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Create Account
                </a>
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;