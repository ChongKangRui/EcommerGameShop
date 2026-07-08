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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type AlertDangerousDialogueProps={
  title?: string,
  content: string,
  triggerText:string,
  triggerClassName?: string,
  onConfirm: ()=>void;

}

export function AlertDangerousDialogue({ content, title = "Warning", triggerText,triggerClassName ,onConfirm}:AlertDangerousDialogueProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button className={triggerClassName}>{triggerText}</Button>} />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {content}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
