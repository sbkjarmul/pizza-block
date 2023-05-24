import React, { ReactComponentElement } from 'react'

interface ButtonProps {
  text: string
  icon?: ReactComponentElement<any>
  onClick?: () => void
}

export const Button = ({ text, icon, onClick }: ButtonProps) => {
  return (
    <button
      className="inline-flex items-center gap-2 rounded border-2 border-[#171515] bg-[#171515] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-transparent hover:text-[#171515] focus:outline-none focus:ring active:opacity-75"
      rel="noreferrer"
      onClick={onClick}
    >
      {icon}
      {text}
    </button>
  )
}
