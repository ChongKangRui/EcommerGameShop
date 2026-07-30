import { useNavigate } from "react-router-dom";


export default function Cell({ title, link }: { title: string, link: string }) {
  const navigate = useNavigate();

  return (
    <div
      className="truncate cursor-pointer hover:underline"
      title={title}
      onClick={() => {navigate(`${link}`)}}
    >
      {title}
    </div>
  );
}