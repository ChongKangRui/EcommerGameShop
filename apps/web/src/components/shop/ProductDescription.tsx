
import { Dot } from "lucide-react";

type ProductDescriptionProps = {
  description: string;
};

export function ProductDescription({ description }: ProductDescriptionProps) {

  if(!description){
    return <div></div>
  }


  const descriptionList = description.split("- ").filter(Boolean);
 // console.log(descriptionList);

  return (
    <div className="px-10 md:px-50 mt-10">
      <h1 className="text-center font-bold text-2xl ">Description</h1>
      <hr className="mt-5" />

      <div className="flex flex-col items-start w-full max-w-2xl mx-auto">
        {descriptionList.map((s, index) => {
          return (
            <div key={s + index} className="flex flex-row items-center">
              <Dot />
              <p className="my-5 text-sm md:text-lg"> {s}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
