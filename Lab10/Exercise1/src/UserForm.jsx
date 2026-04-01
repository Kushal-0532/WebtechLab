import { useState } from 'react'

function UserForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function validate(fields) {
    const errs = {};
    if (!fields.name.trim())
      errs.name = 'Name is required.';
    if (!fields.email.trim())
      errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
      errs.email = 'Enter a valid email address.';
    if (!fields.password)
      errs.password = 'Password is required.';
    else if (fields.password.length < 6)
      errs.password = 'Password must be at least 6 characters.';
    return errs;
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitted(true);
    setForm({ name: '', email: '', password: '' });
    setErrors({});
  }

  return (
    <div className="form-card">
      <h1>User Registration</h1>
      {submitted && <p className="success-msg">Form submitted successfully!</p>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
          {errors.password && <span className="error">{errors.password}</span>}
        </div>
        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
}

export default UserForm;
