import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
      ← Back
    </button>
  );
}


