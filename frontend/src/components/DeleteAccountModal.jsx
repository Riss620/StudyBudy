import React, { useState } from 'react';
import Modal from './Modal';
import Toast from './Toast';
import { FiAlertTriangle, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { sendOtp, verifyOtp, deleteAccount } from '../utils/api';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const DeleteAccountModal = ({ isOpen, onClose, userEmail }) => {
  const { logout } = useContext(AuthContext);
  const [step, setStep] = useState(1); // 1: Confirmation, 2: OTP, 3: Password
  const [email, setEmail] = useState(userEmail || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [hasAgreed, setHasAgreed] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendOtp = async () => {
    if (!hasAgreed) {
      showToast('Please confirm account deletion', 'error');
      return;
    }

    setLoading(true);
    try {
      await sendOtp({ email });
      showToast('OTP sent to your email', 'success');
      setStep(2);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to send OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      showToast('Please enter OTP', 'error');
      return;
    }

    if (otp.length !== 6) {
      showToast('OTP must be 6 digits', 'error');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      showToast('OTP verified successfully', 'success');
      setStep(3);
    } catch (error) {
      showToast(error.response?.data?.message || 'Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      showToast('Please enter your password', 'error');
      return;
    }

    setLoading(true);
    try {
      await deleteAccount({
        email,
        password,
        otp
      });
      showToast('Account deleted successfully', 'success');
      setTimeout(() => {
        logout();
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete account', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setEmail(userEmail || '');
    setOtp('');
    setPassword('');
    setHasAgreed(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Delete Account" size="md" isDanger={true}>
        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold
                    transition-all duration-300
                    ${step >= s ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'}
                  `}
                >
                  {step > s ? '✓' : s}
                </div>
                {s < 3 && (
                  <div
                    className={`
                      flex-1 h-1 mx-2 transition-all duration-300
                      ${step > s ? 'bg-red-600' : 'bg-gray-200'}
                    `}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Confirmation */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              {/* Warning Icon with Animation */}
              <div className="flex justify-center mb-4">
                <div className="animate-rotate-warning">
                  <FiAlertTriangle className="w-16 h-16 text-red-500" />
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">
                  ⚠️ This action cannot be undone
                </h4>
                <p className="text-sm text-red-800">
                  Deleting your account will permanently remove all your data, including:
                </p>
                <ul className="text-sm text-red-800 mt-2 space-y-1 ml-4">
                  <li>• All discussions and posts</li>
                  <li>• Study group memberships</li>
                  <li>• Files and uploads</li>
                  <li>• Account information</li>
                </ul>
              </div>

              <label className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={hasAgreed}
                  onChange={(e) => setHasAgreed(e.target.checked)}
                  className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 mt-0.5"
                  disabled={loading}
                />
                <span className="text-sm text-gray-700">
                  I understand that my account and all data will be permanently deleted
                </span>
              </label>

              <button
                onClick={handleSendOtp}
                disabled={loading || !hasAgreed}
                className="w-full btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>

              <button
                onClick={handleClose}
                disabled={loading}
                className="w-full btn btn-outline"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP (6 digits)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  maxLength="6"
                  className="input text-center text-2xl tracking-widest"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Check your email for the 6-digit OTP
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="flex-1 btn btn-outline"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="flex-1 btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Password Confirmation */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-900 font-semibold">
                  Final Step: Confirm your password to delete your account
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Your Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="input pl-10 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Note:</span> You will be logged out immediately after deletion.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  disabled={loading}
                  className="flex-1 btn btn-outline"
                >
                  Back
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

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

export default DeleteAccountModal;
