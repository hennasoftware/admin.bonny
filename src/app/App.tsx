import {ComingSoon} from "../shared/pages/ComingSoon"
import {ThemeProvider} from "../styles/themes/ThemeContext.tsx"

export default function App() {
    return (
        <ThemeProvider>
            <ComingSoon/>
        </ThemeProvider>
    );
}