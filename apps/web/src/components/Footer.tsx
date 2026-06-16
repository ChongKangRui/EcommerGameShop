
export default function Footer(){
    return (
        <div className="flex justify-center items-center bg-black text-white text-[10px] min-h-10">
            &copy; {new Date().getFullYear()} Redfield Gaming. All rights reserved.
        </div>
    )
}