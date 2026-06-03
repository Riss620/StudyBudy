import React from 'react'

const TextArea = ({ value, onChange, placeholder, rows = 4, disabled = false, maxLength, id, name, ...rest }) => {
  return (
    <div className="relative">
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className={`textarea ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        {...rest}
      />

      {maxLength && (
        <div className="text-xs text-gray-500 absolute right-2 bottom-1 select-none">
          {value ? value.length : 0}/{maxLength}
        </div>
      )}
    </div>
  )
}

export default TextArea
