"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@repo/ui/components/alert-dialog";

export default function ConfirmSubmitButton({ formId, label = "Suspend" }: { formId: string; label?: string }) {
  function submitForm() {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (form) {
      form.submit();
      return;
    }

    // fallback: find nearest form ancestor by id
    let el: HTMLElement | null = document.getElementById(formId);
    while (el && el.nodeName !== "FORM") {
      el = el.parentElement;
    }
    (el as HTMLFormElement | null)?.submit();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50">{label}</button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm suspension</AlertDialogTitle>
          <AlertDialogDescription>Are you sure you want to suspend this user? This action can be reverted by an administrator.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant={'outline'} size={'default'} className="mr-2">Cancel</AlertDialogCancel>
					<AlertDialogAction variant={'default'} size={'default'} onClick={submitForm} className="rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700">Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
