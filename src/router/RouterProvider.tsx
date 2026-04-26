import { BrowserRouter } from "react-router-dom";
import { AppRoute } from "./AppRoute";

export function RouterProvider() {
    return (
        <BrowserRouter>
            <AppRoute />
        </BrowserRouter>
    );
}
