import { useAuth } from "../context/AuthContext.jsx";

function LoginPage() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">✦ SAKHA</div>
        <p className="login-subtitle">Your friendly AI assistant</p>
        <button className="google-btn" onClick={loginWithGoogle}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
          />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;