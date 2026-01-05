import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="main-layout">
            <Sidebar />
            <main className="content-area">
                {children}
            </main>
        </div>
    );
};

export default Layout;
