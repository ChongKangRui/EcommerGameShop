import { useState, useRef, useEffect } from "react";

type QuantitySelectorProps = {
    initialQuantity: number,
  cartCount: number,
  max: number,
  currentQuantity: number,
  setQuantity: (n: number) => void
};

export default function QuantitySelector({
  initialQuantity = 1,
  cartCount = 1,
  max = 99,
  currentQuantity,
  setQuantity
} : QuantitySelectorProps) {
//   const [quantity, setQuantity] = useState(initialQuantity);
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(String(initialQuantity));
  const inputRef = useRef(null);

//   useEffect(() => {
//     if (isEditing && inputRef.current) {
//       inputRef.current.focus();
//       inputRef.current.select();
//     }
//   }, [isEditing]);

  const clamp = (n:number) => Math.min(max, Math.max(1, n));

  const decrement = () => setQuantity( clamp(currentQuantity - 1));
  const increment = () => setQuantity(clamp(currentQuantity + 1));

  const startEditing = () => {
    setDraftValue(String(currentQuantity));
    setIsEditing(true);
  };

  const commitEdit = () => {
    const parsed = parseInt(draftValue, 10);
    setQuantity(Number.isNaN(parsed) ? currentQuantity : clamp(parsed));
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };
   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
     if (e.key === "Enter") {
       e.preventDefault();
       commitEdit();
     } else if (e.key === "Escape") {
       e.preventDefault();
       cancelEdit();
     }
   };

   const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
     const val = e.target.value;
     // allow empty string while typing, otherwise digits only
     if (val === "" || /^\d{1,2}$/.test(val)) {
       setDraftValue(val);
     }
   };

  return (
    <div className="inline-flex flex-col items-start gap-2 font-sans w-full">
      <span className="text-sm text-gray-500">
        Quantity ({cartCount} in cart)
      </span>

      <div className="inline-flex items-stretch rounded-lg border border-gray-300 bg-white overflow-hidden">
        <button
          type="button"
          onClick={decrement}
          disabled={currentQuantity <= 1}
          aria-label="Decrease quantity"
          className="px-auto py-auto w-10 h-10 text-gray-600 text-base leading-none hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400"
        >
          −
        </button>

        <div className="w-px bg-gray-300" />

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={draftValue}
            onChange={handleChange}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className="w-12 text-center text-base text-gray-900 outline-none [appearance:textfield]"
          />
        ) : (
          <button
            type="button"
            onClick={startEditing}
            aria-label="Edit quantity"
            className="w-12 text-center text-base text-gray-900 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400"
          >
            {currentQuantity}
          </button>
        )}

        <div className="w-px bg-gray-300" />

        <button
          type="button"
          onClick={increment}
          disabled={currentQuantity >= max}
          aria-label="Increase quantity"
          className="px-auto py-auto w-10 h-10 text-gray-600 text-base leading-none hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400"
        >
          +
        </button>
      </div>
    </div>
  );
}