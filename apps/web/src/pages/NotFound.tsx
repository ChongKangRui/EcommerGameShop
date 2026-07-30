
import { Link } from "react-router-dom";
export default function NotFound() {

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-5xl px-4">
        {/* Title — hidden on mobile, visible on desktop */}
        <div className="block md:block text-center mb-5 md:-mt-15 md:mb-13">
          <Link className="text-5xl font-bitcount" to={"/"}>
            {"Redfield Gaming"}
          </Link>
          <h2 className="text-2xl font-bitcount mt-5">Page not found</h2>
        </div>


      </div>
    </div>
  );
}
