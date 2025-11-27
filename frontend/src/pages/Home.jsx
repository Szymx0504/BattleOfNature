import { Link } from "react-router-dom";

const HomePage = () => {
    return <div>
        <p>Hello, welcome back!</p>
        <Link to="/play">Play</Link>
        <Link to="/rules">Rules</Link>
    </div>
}

export default HomePage;