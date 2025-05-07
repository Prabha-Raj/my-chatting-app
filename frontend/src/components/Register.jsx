import axios from "axios";
import { useState } from "react";
import {
    FaUser,
    FaUserCircle,
    FaEnvelope,
    FaLock,
    FaImage,
    FaVenusMars,
    FaArrowRight,
    FaEyeSlash,
    FaEye
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        gender: "",
        password: "",
        profilePic: "",
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axios.post('/api/users/register/', formData)
            console.log(res)
            toast.success(res.data.message)
            setIsLoading(false);
            navigate('/login')
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
            console.log(error)
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100 p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* Left side - decorative */}
                    <div className="bg-indigo-600 md:w-1/3 py-10 px-6 hidden md:flex flex-col justify-between">
                        <div>
                            <h2 className="text-white font-bold text-3xl mb-6">Welcome!</h2>
                            <p className="text-indigo-200 mb-8">Create an account and start your journey with us today.</p>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 text-indigo-200">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                    <span className="text-white">1</span>
                                </div>
                                <span>Create your account</span>
                            </div>
                            <div className="flex items-center space-x-2 text-indigo-200">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                    <span className="text-white">2</span>
                                </div>
                                <span>Customize your profile</span>
                            </div>
                            <div className="flex items-center space-x-2 text-indigo-200">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                    <span className="text-white">3</span>
                                </div>
                                <span>Start exploring</span>
                            </div>
                        </div>
                    </div>

                    {/* Right side - form */}
                    <div className="md:w-2/3 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
                            <div className="text-sm text-gray-600">
                                Already registered? <a href="/login" className="text-indigo-600 font-medium hover:text-indigo-800">Sign In</a>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                            <FaUser />
                                        </div>
                                        <input
                                            type="text"
                                            name="fullName"
                                            placeholder="John Doe"
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Username</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                            <FaUserCircle />
                                        </div>
                                        <input
                                            type="text"
                                            name="username"
                                            placeholder="johndoe123"
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                            <FaEnvelope />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="john@example.com"
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Gender</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                            <FaVenusMars />
                                        </div>
                                        <select
                                            name="gender"
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="prefer-not-to-say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Password</label>
                                    <div className="relative">
                                        {/* Lock icon on the left */}
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                            <FaLock />
                                        </div>

                                        {/* Password input */}
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="••••••••"
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />

                                        {/* Eye toggle icon on the right */}
                                        <div
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 cursor-pointer"
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Profile Picture URL</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                            <FaImage />
                                        </div>
                                        <input
                                            type="text"
                                            name="profilePic"
                                            placeholder="https://example.com/avatar.jpg (optional)"
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleRegister}
                                    disabled={isLoading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            Create Account
                                            <FaArrowRight className="ml-2" />
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="pt-2 text-center text-sm text-gray-600">
                                By registering, you agree to our
                                <a href="#" className="text-indigo-600 hover:text-indigo-800 mx-1">Terms of Service</a>
                                and
                                <a href="#" className="text-indigo-600 hover:text-indigo-800 mx-1">Privacy Policy</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;