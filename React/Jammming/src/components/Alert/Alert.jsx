import "./Alert.css";

export default function Alert({ type, text }) {
  return (
    <div className={`alert ${type}`}>
      {text}
    </div>
  );
}
