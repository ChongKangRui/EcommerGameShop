import { Badge } from "@/components/ui/badge";

import { Link } from "react-router";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import QuantitySelector from "./QuantitySelector";
import { Button } from "@/components/ui/button";


type ProductDescriptionProps = {
  description: string;
 
};

export function ProductDescription({ description }: ProductDescriptionProps) {



    
  return (
    <div className="px-10 md:px-50 mt-10">
       <h1 className="text-center font-bold text-2xl ">Description</h1>
<hr className="mt-5"/>

<p className="my-5 text-sm md:text-lg">{description}</p>
    </div>
  );
}
