import { ShopItemCard } from "@/components/shop/ShopItem";
import { Loader, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ShopFilterSelection } from "@/components/shop/ShopFilterSelection";

import { ProductDetail } from "@/components/shop/ProductDetail";
import { ProductDescription } from "@/components/shop/ProductDescription";
import { useProductQuery } from "@/hooks/useProduct";
import { useNavigate, useParams } from "react-router";
import Loading from "@/components/Loading";
import { flashMessage_Failed } from "@/lib/flash";
import { useEffect, useState } from "react";

export default function Product() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, isSuccess } = useProductQuery(id ? id : "");
  const [currentVariationId, setCurrentVariationId] = useState("");

  useEffect(() => {
    if (isSuccess) {
     
      const coverImageVariation =data?.variations.find((v)=>v.image_url === data.product.cover_image_url) ;
     
      // Only update if not already set or if changed
      if (coverImageVariation) {
        setCurrentVariationId(coverImageVariation.variation_id);
      }
    }
  }, [isSuccess]);

  if (isLoading) {
    return <Loading></Loading>;
  }
 
  if (isError || !data?.product) {
    // navigate("/collections/");
    // flashMessage_Failed("Invalid product");
    return (
      <h1 className="flex items-center justify-center min-h-screen text-4xl">
        Product not found
      </h1>
    );
  }

  const product = data.product;
  const productVariation = data.variations;
  const currentProductVariation = productVariation.find((v)=>v.variation_id === currentVariationId);
 

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-center md:items-center  ">
        <img
          src={currentProductVariation?.image_url}
          className="md:w-1/2 md:p-20"
          alt=""
        />

        <ProductDetail
          product={product}
          productVariation={data.variations}
          currentProductVariation={currentProductVariation}
          setCurrentVariationId={setCurrentVariationId}
        ></ProductDetail>
      </div>
      <ProductDescription
        description={data?.product.description}
      ></ProductDescription>
    </div>
  );
}
