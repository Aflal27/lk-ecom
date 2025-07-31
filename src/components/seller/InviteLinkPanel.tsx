import React from 'react'

interface InviteLinkPanelProps {
  inviteLink: string
  copied: boolean
  handleCopy: () => void
}

export default function InviteLinkPanel({
  inviteLink,
  copied,
  handleCopy,
}: InviteLinkPanelProps) {
  return (
    <div className='mt-8 p-4 bg-neutral-100 rounded shadow w-full max-w-lg'>
      <h2 className='text-lg font-semibold mb-2 text-blue-600'>
        Share your customer invite link
      </h2>
      <div className='flex items-center gap-2'>
        <input
          type='text'
          value={inviteLink}
          readOnly
          className='flex-1 px-2 py-1 border rounded bg-neutral-50 text-gray-700'
        />
        <button
          type='button'
          onClick={handleCopy}
          className='px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700'
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className='text-xs text-gray-500 mt-2'>
        Send this link to your customers. When they sign up, they will be linked
        to you automatically.
      </p>
    </div>
  )
}
