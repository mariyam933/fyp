import toast from "react-hot-toast";

export function isUrlValid(userInput) {
  const urlPattern = /^(http|https):\/\/[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]+$/;
  return urlPattern.test(userInput);
}


// status converter
export function statusConverter(status) {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'review':
      return 'In Review'
    case 'published':
      return 'Published'
    case 'active':
      return 'Active'
    default:
      return status
  }
}

export const customerValidate = (name, email, address, phone, meterNo) => {
  const errors = {} as any;

  if (!name || name.trim().length < 3) {
    toast.error("Name must be at least 3 characters long.");
    errors.name = "Name must be at least 3 characters long.";
  }
  else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast.error("Invalid email address.");
    errors.email = "Invalid email address.";
  }
  else if (!address || address.trim().length < 10) {
    toast.error("Address must be at least 10 characters long.");
    errors.address = "Address must be at least 10 characters long.";
  }
  else if (!phone) {
    toast.error("Invalid phone number.");
    errors.phone = "Invalid phone number.";
  }
  else if (!meterNo || meterNo.trim().length < 6) {
    toast.error("Meter number must be at least 6 characters long.");
    errors.meterNo = "Meter number must be at least 6 characters long.";
  }

  return errors;
};


export const billValidate = (unitsConsumed, totalBill, meterSrNo) => {
  const errors = {} as any;
  if (!unitsConsumed) {
    toast.error("Units consumed is required.");
    errors.unitsConsumed = "Units consumed is required.";
  }
  else if (!totalBill) {
    toast.error("Total bill is required.");
    errors.totalBill = "Total bill is required.";
  }
  else if (!meterSrNo) {
    toast.error("Meter Sr. No. is required.");
    errors.meterSrNo = "Meter Sr. No. is required.";
  }

  return errors;
}