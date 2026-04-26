import { HelmetProvider } from "react-helmet-async";
import {ComingSoon} from "../shared/pages/ComingSoon"
import {ThemeProvider} from "../styles/themes/ThemeContext.tsx"

export default function App() {
    return (
        <ThemeProvider>
            <HelmetProvider>
                <ComingSoon/>
            </HelmetProvider>
        </ThemeProvider>
    );
}
