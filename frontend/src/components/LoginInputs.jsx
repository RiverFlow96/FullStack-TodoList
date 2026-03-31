
export function LoginInputs({ type, placeholder, icon }) {
    return (
        <div className="flex flex-row my-6 min-w-full relative">
            {icon}
            <input className="border-b-2 w-full pl-10 pr-4 py-2" type={type} placeholder={placeholder} />
        </div>
    )
}
