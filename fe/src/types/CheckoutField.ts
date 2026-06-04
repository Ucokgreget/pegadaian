export type InputType = "text" | "phone" | "textarea";

export interface CheckoutField {
  id: number;
  userId: number;
  label: string;
  fieldKey: string;
  question: string;
  inputType: InputType;
  isRequired: boolean;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export type CreateCheckoutFieldInput = {
  label: string;
  fieldKey: string;
  question: string;
  inputType?: InputType;
  isRequired?: boolean;
  order?: number;
  isActive?: boolean;
};

export type UpdateCheckoutFieldInput = Partial<CreateCheckoutFieldInput>;

export type ReorderItem = { id: number; order: number };
