import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type AlertDangerousDialogueProps = {
  title?: string;
  content: React.ReactNode;
  trigger: React.ReactNode;
  triggerClassName?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disableButton?:boolean
};

export function PopupDialogue({
  content,
  title = "Warning",
  trigger,
  triggerClassName,
  onConfirm,
  onCancel,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  disableButton=false
}: AlertDangerousDialogueProps) {
  const [internalOpen, setInternalOpen] = useState(false);

   const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

  const onConfirmClick = () => {
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger
        render={<Button className={triggerClassName}>{trigger}</Button>}
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {content}
          {/* <AlertDialogDescription>{content}</AlertDialogDescription> */}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={disableButton}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirmClick} disabled={disableButton}>
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
