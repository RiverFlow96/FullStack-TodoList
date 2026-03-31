
export function LoginInputs({ type, placeholder, icon }) {
    return (
        <div className="flex flex-row my-4 sm:my-5 min-w-full relative">
            {icon}
            <input className="border-b-2 w-full pl-10 pr-4 py-2.5 text-sm sm:text-base outline-none focus:border-violet-600 transition-colors" type={type} placeholder={placeholder} />
        </div>
    )
}
