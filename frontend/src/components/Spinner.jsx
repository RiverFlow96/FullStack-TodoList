import React from 'react'

function Spinner({ color }) {
    return (
        <div className={`${color} rounded-full w-10 h-10 border-violet-700 animate-spin border-4 border-t-transparent`}></div>
    )
}

export default Spinner