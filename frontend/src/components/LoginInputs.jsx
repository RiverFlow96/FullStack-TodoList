
export function LoginInputs({ type, placeholder, label }) {
    return (
        <div>
            <span>{label}</span>
            <input type={type} placeholder={placeholder} />
        </div>
    )
}
