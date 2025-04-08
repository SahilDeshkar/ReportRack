import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import Dashboard from './components/Dashboard/Dashboard';
import DashboardList from './components/Dashboard/DashboardList';
import LandingPage from './components/Landing/LandingPage'; // Add this import

const App = () => {
    return (
        <Router>
            <Switch>
                <Route exact path="/" component={LandingPage} /> // Change this route
                <Route path="/login" component={LoginForm} /> // Add this route
                <Route path="/signup" component={SignupForm} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/browse" component={DashboardList} />
            </Switch>
        </Router>
    );
};

export default App;