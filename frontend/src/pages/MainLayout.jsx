import { Outlet } from "react-router-dom";

const MainLayout = () => {
    return <div>
        <p>Main layout</p>
        <main>
            <Outlet />
        </main>
    </div>    
}

export default MainLayout;