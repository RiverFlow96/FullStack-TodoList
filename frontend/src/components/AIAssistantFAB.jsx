import { Sparkles } from "lucide-react";

function AIAssistantFAB({ onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-14 h-14 rounded-full bg-indigo-600 shadow-lg hover:bg-indigo-700 hover:scale-110 transition-transform flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
            aria-label="Open AI assistant"
            title="AI assistant"
        >
            <Sparkles className="w-6 h-6 text-white" />
        </button>
    )
}

export default AIAssistantFAB
