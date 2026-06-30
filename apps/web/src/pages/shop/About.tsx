import CommentCarousel from "../../components/about/CommentCarousel"

export default function About() {
  return (
    <div>
      <div className=" text-center flex flex-col items-center gap-5 mt-5">
        <h1 className="text-2xl font-bold">We bring game to you</h1>

        <img src="/ShopImage.jpg" className="w-[20em] h-[15em] md:w-[30em] md:h-[20em]" alt="" />

        <p className="px-4 md:px-10 lg:px-20">
          Here at Redfield Gaming, we equip our players (YOU LEGENDS) with the
          hottest drops, exclusive gear, and pro-level peripherals without
          draining your wallet! We’re also live on Lazada and Shopee. Your true home base
          and battleground for gamers.
        </p>
      </div>
      <hr className="mt-5" />
      <div className=" text-center flex flex-col items-center gap-5 mt-5 mb-20">
        <h1 className="text-2xl font-bold text-center">Customer Feedback</h1>
        <img src="/QuotationMarksImage.png" className="w-20 h-20" alt="" />
        <CommentCarousel>

        </CommentCarousel>
      
      </div>
      
    </div>
  );
}
