import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Toast from './Toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { sendOtp, verifyOtp, changePassword } from '../utils/api';

const ChangePasswordModal = ({ isOpen, onClose, userEmail }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [email, setEmail] = useState(userEmail || '');
  const [otp, setOtp] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP resend timer
  const [resendTimer, setResendTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  // Timer effect for OTP resend
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      showToast('Please enter your email', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await sendOtp({ email: email.trim() });
      showToast('✅ OTP sent to your email (Check spam folder)', 'success');
      setOtpSent(true);
      setResendTimer(30); // 30 second resend timer
      setStep(2);
      setOtp(''); // Clear OTP input
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send OTP. Check email configuration.';
      showToast(errorMsg, 'error');
      console.error('Send OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      showToast('Please enter the OTP', 'error');
      return;
    }

    if (otp.trim().length !== 6) {
      showToast('OTP must be exactly 6 digits', 'error');
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      showToast('OTP must contain only numbers', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp({ email: email.trim(), otp: otp.trim() });
      showToast('✅ OTP verified successfully', 'success');
      setStep(3);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid OTP. Please try again.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('All password fields are required', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (currentPassword === newPassword) {
      showToast('New password cannot be the same as current password', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword({
        email: email.trim(),
        currentPassword,
        newPassword,
        otp: otp.trim()
      });
      showToast('✅ Password changed successfully!', 'success');
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to change password. Please try again.';
      showToast(errorMsg, 'error');
      console.error('Change password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setEmail(userEmail || '');
    setOtp('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setResendTimer(0);
    setOtpSent(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="🔐 Change Password" size="md">
        <div className="space-y-6">
          {/* Step Indicator with Animations */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    transition-all duration-500 transform
                    ${step >= s ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-100' : 'bg-gray-200 text-gray-600 scale-90'}
                  `}
                >
                  {step > s ? (
                    <FiCheckCircle className="w-6 h-6" />
                  ) : (
                    s
                  )}
                </div>
                {s < 3 && (
                  <div
                    className={`
                      flex-1 h-1 mx-2 transition-all duration-500
                      ${step > s ? 'bg-blue-600' : 'bg-gray-200'}
                    `}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Email & Send OTP */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📧 Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">We'll send a 6-digit code to this email</p>
              </div>
              <button
                onClick={handleSendOtp}
                disabled={loading || !email.trim()}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition duration-200
                  ${loading || !email.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
                  }
                `}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending OTP...
                  </span>
                ) : (
                  '📤 Send OTP'
                )}
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔐 Enter OTP (6 digits)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setOtp(val.slice(0, 6));
                  }}
                  placeholder="000000"
                  maxLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-3xl tracking-widest font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-1">Check your email (and spam folder) for the code</p>
              </div>

              {/* Resend Timer */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Didn't receive the OTP?</span>
                <button
                  onClick={handleSendOtp}
                  disabled={resendTimer > 0 || loading}
                  className={`text-sm font-semibold transition
                    ${resendTimer > 0 || loading
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:text-blue-700'
                    }
                  `}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setResendTimer(0);
                  }}
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  ← Back
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length !== 6}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition
                    ${loading || otp.length !== 6
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                    }
                  `}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    '✓ Verify OTP'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <FiCheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700 font-medium">OTP verified! Now update your password</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔒 Current Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🔑 New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ✓ Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                >
                  ← Back
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition
                    ${loading || !currentPassword || !newPassword || !confirmPassword
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'
                    }
                  `}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    '🚀 Update Password'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default ChangePasswordModal;
