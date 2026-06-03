import { Link } from 'react-router-dom'

export const EmptyState = ({ icon: Icon, title, description, actionLabel, actionLink, actionCallback }) => {
  return (
    <div className="card text-center py-16">
      {Icon && <Icon className="w-20 h-20 text-gray-300 mx-auto mb-4" />}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>}
      {actionLabel && (actionLink ? (
        <Link to={actionLink} className="btn btn-primary">
          {actionLabel}
        </Link>
      ) : actionCallback ? (
        <button onClick={actionCallback} className="btn btn-primary">
          {actionLabel}
        </button>
      ) : null)}
    </div>
  )
}

export default EmptyState
