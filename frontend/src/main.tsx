import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import PageComponent from '@/components/PageComponent.tsx';
import { ThemeProvider } from '@/components/theme-provider.tsx';
import Privacy from '@/pages/Privacy.tsx';
import Create from '@/pages/Create/Create.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster.tsx';

import '@fontsource/m-plus-rounded-1c';
import '@fontsource/fira-sans-condensed';

const router = createBrowserRouter([
    {
        path: "/",
        element: <PageComponent/>,
        children:[
            {
                path: "/",
                element: <App/>
            },
            {
                path:"/privacy",
                element: <Privacy/>
            },
            {
                path:"/create",
                element: <Create/>
            },
            {
                path:"/:poll",
                element: <App/>
            }
        ]
    },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Toaster/>
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
                <RouterProvider router={router} />
            </ThemeProvider>
        </QueryClientProvider>
    </StrictMode>,
);
