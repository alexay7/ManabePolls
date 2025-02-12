import {HttpError} from "@/types/error";

async function request<TResponse>(url: string, config: RequestInit): Promise<TResponse> {
    let token = localStorage.getItem("bearerToken");

    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`
        };
    }

    const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/${url}`, config);
    if (response.status > 399) {
        const errorResponse = await response.json() as HttpError;
        if (errorResponse.status === 401) {
            // Retry the request
            token = localStorage.getItem("bearerToken");

            if (token) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${token}`
                };
            }

            const retryResponse = await fetch(`${import.meta.env.VITE_APP_API_URL}/${url}`, config);

            if (retryResponse.status > 399) {
                const retryErrorResponse = await retryResponse.json() as HttpError;
                if (retryErrorResponse.status === 401) {
                    localStorage.removeItem("bearerToken");
                    window.location.reload();
                }
            }

            return retryResponse.json() as TResponse;
        }
        throw new HttpError(errorResponse.message, response.status, "NONE");
    }
    return response.json() as TResponse;
}

export const api = {
    get: <TResponse>(url: string): Promise<TResponse> =>
        request<TResponse>(url, {method: "GET"}),

    delete: <TResponse>(url: string): Promise<TResponse> =>
        request<TResponse>(url, {method: "DELETE"}),

    post: <TBody, TResponse>(url: string, body?: TBody, keepAlive?: boolean): Promise<TResponse> =>
        request<TResponse>(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {"Content-Type": "application/json"},
            keepalive: keepAlive
        }),

    patch: <TBody, TResponse>(url: string, body?: TBody, keepAlive?: boolean): Promise<TResponse> =>
        request<TResponse>(url, {
            method: "PATCH",
            body: JSON.stringify(body),
            headers: {"Content-Type": "application/json"},
            keepalive: keepAlive
        }),

    put: <TBody, TResponse>(url: string, body?: TBody, keepAlive?: boolean): Promise<TResponse> =>
        request<TResponse>(url, {
            method: "PUT",
            body: JSON.stringify(body),
            headers: {"Content-Type": "application/json"},
            keepalive: keepAlive
        })
};