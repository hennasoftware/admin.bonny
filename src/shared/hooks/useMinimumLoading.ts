import { useEffect, useState } from "react";

export function useMinimumLoading(loading: boolean, minTime = 1200) {
    const [show, setShow] = useState(true);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;

        if (!loading) {
            timer = setTimeout(() => {
                setShow(false);
            }, minTime);
        } else {
            setShow(true);
        }

        return () => clearTimeout(timer);
    }, [loading, minTime]);

    return show;
}
