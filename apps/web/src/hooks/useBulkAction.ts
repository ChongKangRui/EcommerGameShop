// hooks/useBulkAction.ts
import { useState } from "react";
import { useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { flashMessage_Failed, flashMessage_Success } from "@/lib/flash";

type UseBulkActionOptions<TValue, TVariables, TResult extends { message?: string }> = {
  mutation: UseMutationResult<TResult, Error, TVariables>;
  getSelectedProductID: () => number[];
  buildVariables: (productIds: number[], value: TValue) => TVariables;
  initialValue: TValue;
  validate?: (value: TValue) => string | null; // return error message or null
  invalidateKey?: string[];
  setDialogueButtonDisable:(disable: boolean) => void;
};

export function useBulkAction<TValue, TVariables, TResult extends { message?: string }>({
  mutation,
  getSelectedProductID,
  buildVariables,
  initialValue,
  validate,
  invalidateKey = ["products"],
  setDialogueButtonDisable
}: UseBulkActionOptions<TValue, TVariables, TResult>) {
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [value, setValue] = useState<TValue>(initialValue);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  const reset = () => {
    setValue(initialValue);
    setError("");
  };

  const updateValue = (next: TValue) => {
    if (validate) {
      const err = validate(next);
      setError(err ?? "");
    }
    setValue(next);
  };

  const confirm = () => {
    if (validate) {
      const err = validate(value);
      if (err) {
        setError(err);
        return;
      }
    }

    const productIds = getSelectedProductID();
    setDialogueButtonDisable(true);
    mutation.mutate(buildVariables(productIds, value), {
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: invalidateKey, refetchType: "active" });
        setDialogueOpen(false);
        
        reset();
        flashMessage_Success(res?.message ?? "Action success");
      },
      onError: (err: any) => {
        setDialogueOpen(false);
       
        reset();
        flashMessage_Failed(err?.message ?? "Invalid action");
      },
    });
  };

  return {
    dialogueOpen,
    setDialogueOpen,
    value,
    setValue: updateValue,
    error,
    setError,
    confirm,
    onCancel: reset,
    isPending: mutation.isPending,
  };
}