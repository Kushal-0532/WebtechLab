import StudentCard from './StudentCard'
import './App.css'

const students = [
  { id: 1, name: "Kushal", department: "CSE", marks: 92 },
  { id: 2, name: "Arjun",  department: "ECE", marks: 85 },
  { id: 3, name: "Priya",  department: "IT",  marks: 88 },
];

function App() {
  return (
    <div className="app-container">
      {students.map(s => (
        <StudentCard key={s.id} name={s.name} department={s.department} marks={s.marks} />
      ))}
    </div>
  );
}

export default App
