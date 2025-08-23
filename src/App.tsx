import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './screens/login/Login';
import Register from './screens/register/Register';

function App() {

  return (
    <Router>
      <Routes>
        {/* Redirect root `/` to `/login` */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;
