import { Button } from "@base-ui/react";
import { useState, useRef } from "react";

type QuantitySelectorProps = {
  initialQuantity: number;
  displayItemInCart?: boolean;
  cartCount: number;
  max: number;
  currentQuantity: number;
  disabled?: boolean;
  setQuantity: (n: number) => void;
};

export default function QuantitySelector({
  initialQuantity = 1,
  displayItemInCart = true,
  cartCount = 1,
  max = 99,
  currentQuantity,
  disabled = false,
  setQuantity,
}: QuantitySelectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState(String(initialQuantity));
  const inputRef = useRef(null);

  const isOutOfStock = max <= 0;
 
  // Bug fix: previously Math.min(max, Math.max(1, n)) forced a floor of 1
  // before capping at max, so when max <= 0 the result became 0 and
  // both +/- buttons ended up permanently disabled with no way out.
  const clamp = (n: number) => {
    if (isOutOfStock) return 0;
    return Math.min(max, Math.max(1, n));
  };

  const decrement = () => {setQuantity(clamp(currentQuantity - 1))};
  const increment = () => {

    setQuantity(clamp(currentQuantity + 1));
  };

  const startEditing = () => {
    if (isOutOfStock) return;
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // allow empty string while typing, otherwise digits only
    if (val === "" || /^\d{1,2}$/.test(val)) {
      setDraftValue(val);
    }
  };

  if (isOutOfStock) {
    return (
      <div className="inline-flex flex-col items-start gap-2 font-sans">
        {displayItemInCart && (
          <span className="text-sm text-gray-500">
            Quantity ({cartCount} in cart)
          </span>
        )}
        <div className="inline-flex items-center rounded-lg border border-gray-300 bg-gray-50 px-3 h-10 text-sm text-gray-500">
          Out of stock
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-2 font-sans">
      {displayItemInCart && (
        <span className="text-sm text-gray-500">
          Quantity ({cartCount} in cart)
        </span>
      )}

      <div className="inline-flex items-stretch rounded-lg border border-gray-300 bg-white overflow-hidden">
        <Button
          type="button"
          onClick={decrement}
          
          disabled={currentQuantity <= 1 || disabled}
          aria-label="Decrease quantity"
          className="px-auto py-auto w-10 h-10 text-gray-600 text-base leading-none hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400"
        >
          −
        </Button>

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
          <Button
            type="button"
            onClick={startEditing}
            disabled={disabled}
            aria-label="Edit quantity"
            className="w-12 text-center text-base text-gray-900 hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400"
          >
            {currentQuantity}
          </Button>
        )}

        <div className="w-px bg-gray-300" />

        <Button
          type="button"
          onClick={increment}
          disabled={currentQuantity >= max || disabled}
          aria-label="Increase quantity"
          className="px-auto py-auto w-10 h-10 text-gray-600 text-base leading-none hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-400"
        >
          +
        </Button>
      </div>
    </div>
  );
}
