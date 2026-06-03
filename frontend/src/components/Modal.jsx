import { FiX } from 'react-icons/fi'

const Modal = ({ isOpen, onClose, title, children, size = 'md', isDanger = false }) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay - animated */}
        <div
          className="fixed inset-0 transition-all duration-300 bg-gray-500 bg-opacity-75 animate-fade-in"
          onClick={onClose}
        ></div>

        {/* Modal panel - animated */}
        <div className={`
          inline-block align-bottom bg-white rounded-xl text-left overflow-hidden 
          shadow-2xl transform transition-all duration-300 sm:my-8 sm:align-middle w-full 
          ${sizeClasses[size]} animate-slide-up
          ${isDanger ? 'border-l-4 border-red-500' : ''}
        `}>
          {/* Header */}
          <div className={`
            flex items-center justify-between px-6 py-4 
            ${isDanger ? 'bg-red-50 border-b-2 border-red-200' : 'border-b border-gray-200'}
          `}>
            <h3 className={`
              text-xl font-semibold 
              ${isDanger ? 'text-red-900' : 'text-gray-900'}
            `}>
              {title}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-110"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal

