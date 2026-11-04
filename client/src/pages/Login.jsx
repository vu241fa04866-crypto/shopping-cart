import { useState } from 'react'
import PropTypes from 'prop-types'
import { Eye, EyeOff, ShoppingCart, Mail, Lock, User } from 'lucide-react'
import toast from "react-hot-toast"
import {  useNavigate } from 'react-router-dom'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'

const Login = ({getUser}) => {
  const initialData = {
    email:"",
    password:""
  }
  
  const [formData,setFormData] = useState(initialData)
  const [loading,setLoading] = useState(false)
  const [googleLoading,setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const googleConfigured = googleClientId && !googleClientId.startsWith('replace-')

  const handleChange = (e) => {
    const {name,value} = e.target;
    setFormData({
      ...formData,
      [name]:value
    })
  }

  const handleGoogleSuccess = async ({ credential }) => {
    if (!credential) {
      toast.error('Google did not return a sign-in credential.')
      return
    }

    try {
      setGoogleLoading(true)
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ credential })
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        toast.error(data.message || 'Google sign-in failed.')
        return
      }

      await getUser()
      toast.success(data.message)
      navigate('/')
    } catch (error) {
      toast.error(error.message || 'Google sign-in failed.')
    } finally {
      setGoogleLoading(false)
    }
  }

   const handleSubmit = async(e) =>{
    e.preventDefault()
   
    try{
      setLoading(true)
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        credentials:'include',
        body:JSON.stringify(formData)
      })

      const data = await res.json()

      if(data.success){
        setFormData(initialData)
        toast.success(data.message)
        getUser()
        navigate("/")
      }else{
        toast.error(data.message)
      }

    }catch(error){

      toast.error("Something went wrong.")
      console.log(error)
    }finally{
      
      setLoading(false)
      
    }

  }

  return (
    <div className='min-h-screen pt-32 pb-10 flex items-center justify-center px-4'>
     
      
      {/* Login Card */}
      <div className='relative z-10 w-full max-w-md'>
        <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mb-4 shadow-lg'>
              <ShoppingCart className='w-8 h-8 ' />
            </div>
            <h1 className='text-3xl font-bold  mb-2'>Welcome Back!</h1>
            <p>Sign in to your shopping account</p>
          </div>

          <div className='mb-6 flex flex-col items-center gap-3'>
            {googleConfigured ? (
              <GoogleOAuthProvider clientId={googleClientId}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google sign-in failed. Please try again.')}
                  useOneTap={false}
                  text="continue_with"
                  shape="rectangular"
                  width="340"
                />
              </GoogleOAuthProvider>
            ) : (
              <div
                className="w-full"
                title="Google sign-in is unavailable until both app environment files have the same Google OAuth Web client ID."
                aria-describedby="google-signin-help"
              >
                <button
                  type="button"
                  disabled
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-500 disabled:cursor-not-allowed"
                >
                  Continue with Google
                </button>
              </div>
            )}
            {googleConfigured && googleLoading && (
              <span className="text-sm text-gray-500">Signing in with Google...</span>
            )}
            {!googleConfigured && (
              <p id="google-signin-help" className="max-w-sm text-center text-xs leading-relaxed text-gray-600">
                Google sign-in is unavailable because its client ID is not configured.
                Add your Google OAuth Web client ID to <code>client/.env</code> as
                {' '}<code>VITE_GOOGLE_CLIENT_ID</code> and <code>server/.env</code> as
                {' '}<code>GOOGLE_CLIENT_ID</code>, then restart both apps. The client ID
                must also allow this site&apos;s origin.
              </p>
            )}
          </div>

          <div className='mb-6 flex items-center'>
            <div className='flex-1 border-t border-white/20'></div>
            <span className='px-4 text-sm text-gray-500'>or continue with email</span>
            <div className='flex-1 border-t border-white/20'></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Email Field */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Mail className='h-5 w-5 -400' />
              </div>
              <input 
                type="email" 
                placeholder='Enter your email' 
                name='email' 
                className='w-full pl-10 pr-4 py-3 bg-white/10 border border-gray-300 rounded-xl  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300' 
                value={formData.email} 
                onChange={handleChange} 
                required 
                autoComplete='off'
              />
            </div>

            {/* Password Field */}
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Lock className='h-5 w-5 -400' />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder='Enter your password' 
                name='password' 
                className='w-full pl-10 pr-12 py-3 bg-white/10 border border-gray-300 rounded-xl  placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300' 
                value={formData.password} 
                onChange={handleChange} 
                required 
                autoComplete='off'
              />
              <button
                type="button"
                className='absolute inset-y-0 right-0 pr-3 flex items-center -400 hover: transition-colors'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className='h-5 w-5' /> : <Eye className='h-5 w-5' />}
              </button>
            </div>

            {/* Login Button */}
            <button 
              type='submit' 
              className='w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500  font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            >
              {loading ? (
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                  Signing in...
                </div>
              ) : (
                <div className='flex items-center justify-center'>
                  <User className='w-5 h-5 mr-2' />
                  Sign In
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className='my-6 flex items-center'>
            <div className='flex-1 border-t border-white/20'></div>
            <span className='px-4 -300 text-sm'>or</span>
            <div className='flex-1 border-t border-white/20'></div>
          </div>

          {/* Register Link */}
          <div className='text-center'>
            <p className='-300'>
              Don&apos;t have an account?{' '}
              <button 
                className='text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-300 hover:underline'
                onClick={() => navigate("/register")}
              >
                Create Account
              </button>
            </p>
          </div>

        
        </div>

      
      </div>
    </div>
  )
}

Login.propTypes = {
  getUser: PropTypes.func.isRequired
}

export default Login