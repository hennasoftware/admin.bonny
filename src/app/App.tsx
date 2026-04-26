import { AppProviders } from "@/app/AppProviders";
import { RouterProvider } from "@/router";

export default function App() {
    return (
        <AppProviders>
            <RouterProvider />
        </AppProviders>
    );
}
