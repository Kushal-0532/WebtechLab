function StudentProfile() {
  const name = "Kushal";
  const department = "Computer Science and Engineering";
  const year = 3;
  const section = "A";

  return (
    <div className="profile-card">
      <h1>Student Profile</h1>
      <div className="profile-details">
        <p><span className="label">Name:</span> {name}</p>
        <p><span className="label">Department:</span> {department}</p>
        <p><span className="label">Year:</span> {year}</p>
        <p><span className="label">Section:</span> {section}</p>
      </div>
    </div>
  );
}

export default StudentProfile;
