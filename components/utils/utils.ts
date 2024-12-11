import { RelationshipType } from "@/services/types";
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRelationType(type: string) {
  switch (type) {
    case "ONE_TO_ONE":
      return RelationshipType.OneToOne;
    case "ONE_TO_MANY":
      return RelationshipType.OneToMany;
    case "MANY_TO_ONE":
      return RelationshipType.ManyToOne;
    default:
      return RelationshipType.OneToOne;
  }
}
