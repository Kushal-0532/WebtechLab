function StudentCard({ name, department, marks }) {
  return (
    <div className="student-card">
      <h2>{name}</h2>
      <p><span className="label">Department:</span> {department}</p>
      <p><span className="label">Marks:</span> {marks}</p>
    </div>
  );
}

export default StudentCard;
