import { useRef } from "react";

function Login() {
  let userEmail = useRef<null | HTMLInputElement>(null);
  let userPassword = useRef<null | HTMLInputElement>(null);

  return (
    <div className="login-full">
      <div className="login-form">
        <h1>Welcome back</h1>
        <label className="login-labels" htmlFor="email">
          Your Email
        </label>
        <input
          className="login-inputs"
          id="email"
          placeholder="Email"
          type="text"
          ref={userEmail}
          required
        />
        <label htmlFor="password" className="login-labels">
          Your password
        </label>
        <input
          id="password"
          className="login-inputs"
          placeholder="password123"
          ref={userPassword}
          required
        />

        <button className="login-submit">Log in</button>
      </div>
      <div className="login-content">;</div>
    </div>
  );
}

export default Login;
